
import http.server
import socketserver
import json
import os
from datetime import datetime
from urllib.parse import urlparse, parse_qs

# --- Data File Paths ---
USERS_FILE = "users.json"
ENROLLMENTS_FILE = "enrollments.json"
AUDIT_FILE = "audit.json"

# Get port from environment variable for Render, default to 5000 for local dev
PORT = int(os.environ.get('PORT', 5000))

# --- Helper Functions ---
def load_data(path, default=None):
    if default is None:
        default = []
    if not os.path.exists(path):
        return default
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError):
        return default

def save_data(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)

def append_audit(action, actor, details=None):
    if details is None:
        details = {}
    entry = {
        "ts": datetime.now().isoformat(timespec="seconds"),
        "action": action,
        "actor": actor,
        "details": details
    }
    audit_log = load_data(AUDIT_FILE)
    audit_log.append(entry)
    save_data(AUDIT_FILE, audit_log)

# --- HTTP Request Handler ---
class SimpleHTTPRequestHandler(http.server.BaseHTTPRequestHandler):
    def _send_response(self, status_code, data, content_type="application/json"):
        self.send_response(status_code)
        self.send_header("Content-type", content_type)
        # Add CORS headers
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "X-Requested-With, Content-type")
        self.end_headers()
        if data is not None:
            self.wfile.write(json.dumps(data).encode('utf-8'))

    def do_OPTIONS(self):
        # Send headers for pre-flight requests
        self._send_response(204, None)

    def do_GET(self):
        parsed_path = urlparse(self.path)
        path = parsed_path.path

        if path == '/enrollments':
            self.handle_get_enrollments(parsed_path)
        elif path == '/users':
            self.handle_get_users()
        else:
            self._send_response(404, {"error": "Not Found"})

    def do_POST(self):
        parsed_path = urlparse(self.path)
        path = parsed_path.path

        if path == '/login':
            self.handle_login()
        elif path == '/register':
            self.handle_register()
        elif path.startswith('/enrollments/') and path.endswith('/action'):
            self.handle_enrollment_action()
        else:
            self._send_response(404, {"error": "Not Found"})

    # --- GET Handlers ---
    def handle_get_enrollments(self, parsed_path):
        query_components = parse_qs(parsed_path.query)
        teacher_usn = query_components.get("teacher_usn", [None])[0]
        status = query_components.get("status", [None])[0]

        if not teacher_usn:
            self._send_response(400, {"error": "teacher_usn parameter is required"})
            return

        all_enrollments = load_data(ENROLLMENTS_FILE)
        filtered_enrollments = [e for e in all_enrollments if e.get("teacher") == teacher_usn]

        if status:
            filtered_enrollments = [e for e in filtered_enrollments if e.get("status", "").lower() == status.lower()]

        self._send_response(200, filtered_enrollments)
        
    def handle_get_users(self):
        users = load_data(USERS_FILE, default=[])
        # IMPORTANT: Do not send passwords to the client
        users_safe = [{k: v for k, v in u.items() if k != 'password'} for u in users]
        self._send_response(200, users_safe)

    # --- POST Handlers ---
    def get_post_body(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        return json.loads(post_data.decode('utf-8'))

    def handle_login(self):
        body = self.get_post_body()
        usn = body.get('usn')
        password = body.get('password')

        if not usn or not password:
            self._send_response(400, {"error": "USN and password are required"})
            return

        users = load_data(USERS_FILE)
        for user in users:
            if user.get('usn') == usn and user.get('password') == password:
                # Return user data but exclude password for security
                user_data = {k: v for k, v in user.items() if k != 'password'}
                self._send_response(200, user_data)
                return
        
        self._send_response(401, {"error": "Invalid USN or password"})

    def handle_register(self):
        body = self.get_post_body()
        usn = body.get('usn')

        if not all(k in body for k in ['usn', 'password', 'name', 'role']):
            self._send_response(400, {"error": "Missing required fields for registration"})
            return

        users = load_data(USERS_FILE)
        if any(u.get('usn') == usn for u in users):
            self._send_response(409, {"error": "User with this USN already exists"})
            return

        new_user = {
            "usn": body['usn'],
            "password": body['password'],
            "name": body['name'],
            "role": body['role'],
        }
        users.append(new_user)
        save_data(USERS_FILE, users)
        append_audit("User Registered", "system", {"usn": usn, "role": body['role']})
        
        # Return created user data but exclude password
        user_data = {k: v for k, v in new_user.items() if k != 'password'}
        self._send_response(201, user_data)

    def handle_enrollment_action(self):
        path_parts = self.path.strip('/').split('/')
        enrollment_id = path_parts[1]
        body = self.get_post_body()
        action = body.get('action')
        actor = body.get('actor', 'unknown')

        if not action or action not in ['approve', 'decline']:
            self._send_response(400, {"error": "Invalid action"})
            return

        all_enrollments = load_data(ENROLLMENTS_FILE)
        enrollment_found = False
        target_enrollment = None

        for e in all_enrollments:
            if e.get('id') == enrollment_id:
                if e.get('status', '').lower() != 'pending':
                    self._send_response(409, {"error": "Enrollment is not in pending state"})
                    return
                
                enrollment_found = True
                target_enrollment = e
                e['status'] = 'Approved' if action == 'approve' else 'Declined'
                append_audit(f"Enrollment {e['status']}", actor, {"enrollment_id": enrollment_id, "student": e.get("student")})
                break
        
        if not enrollment_found:
            self._send_response(404, {"error": "Enrollment not found"})
            return

        save_data(ENROLLMENTS_FILE, all_enrollments)
        self._send_response(200, {"message": f"Enrollment {target_enrollment['status'].lower()}"})


# --- Main Execution ---
if __name__ == "__main__":
    # Ensure data files exist
    for file, default_content in [(USERS_FILE, []), (ENROLLMENTS_FILE, []), (AUDIT_FILE, [])]:
        if not os.path.exists(file):
            save_data(file, default_content)

    with socketserver.TCPServer(("", PORT), SimpleHTTPRequestHandler) as httpd:
        print(f"Serving at port {PORT}")
        httpd.serve_forever()
