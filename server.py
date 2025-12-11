import http.server
import socketserver
import json
import os
from datetime import datetime
from urllib.parse import urlparse, parse_qs

# --- Data File Paths ---
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
        if parsed_path.path == '/enrollments':
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
        else:
            self._send_response(404, {"error": "Not Found"})

    def do_POST(self):
        parsed_path = urlparse(self.path)
        path_parts = parsed_path.path.strip('/').split('/')

        if len(path_parts) == 3 and path_parts[0] == 'enrollments' and path_parts[2] == 'action':
            enrollment_id = path_parts[1]
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            body = json.loads(post_data.decode('utf-8'))
            
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
                    enrollment_found = True
                    target_enrollment = e
                    if e.get('status', '').lower() != 'pending':
                        self._send_response(409, {"error": "Enrollment is not in pending state"})
                        return

                    e['status'] = 'Approved' if action == 'approve' else 'Declined'
                    
                    append_audit(f"Enrollment {e['status']}", actor, {"enrollment_id": enrollment_id, "student": e.get("student")})
                    break
            
            if not enrollment_found:
                self._send_response(404, {"error": "Enrollment not found"})
                return

            save_data(ENROLLMENTS_FILE, all_enrollments)
            self._send_response(200, {"message": f"Enrollment {target_enrollment['status'].lower()}"})
        else:
            self._send_response(404, {"error": "Not Found"})

# --- Main Execution ---
if __name__ == "__main__":
    # Ensure data files exist
    if not os.path.exists(ENROLLMENTS_FILE):
        save_data(ENROLLMENTS_FILE, [])
    if not os.path.exists(AUDIT_FILE):
        save_data(AUDIT_FILE, [])

    with socketserver.TCPServer(("", PORT), SimpleHTTPRequestHandler) as httpd:
        print(f"Serving at port {PORT}")
        httpd.serve_forever()
