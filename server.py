import http.server
import socketserver
import json
import os
from datetime import datetime
from urllib.parse import urlparse, parse_qs
import uuid

# --- Data File Paths ---
# These paths are relative to the DATA_DIR now
USERS_FILE = "users.json"
ENROLLMENTS_FILE = "enrollments.json"
AUDIT_FILE = "audit.json"
SUBJECTS_FILE = "subjects.json"
TEACHERS_FILE = "teachers.json"
REQUESTS_FILE = "requests.json"
ATT_FILE = "attendance.json"
SETTINGS_FILE = "settings.json"
LIBRARY_FILE = "library.json"
BORROW_FILE = "borrow_requests.json"
BORROW_RECORDS_FILE = "borrow_records.json"

PORT = int(os.environ.get('PORT', 8000))
# The directory where data files are stored.
# Render runs the script from the root, so we need to specify the folder.
DATA_DIR = "backend" 

# --- Helper Functions ---
def get_data_path(file_name):
    """Constructs the full path for a data file within the DATA_DIR."""
    return os.path.join(DATA_DIR, file_name)

def load_data(path, default=None):
    if default is None: 
        default = []
    full_path = get_data_path(path)
    if not os.path.exists(full_path):
        # If the file doesn't exist, create the directory and the file.
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        save_data(path, default) # Save the default content
        return default
    try:
        with open(full_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError):
        return default

def save_data(path, data):
    full_path = get_data_path(path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)

def append_audit(action, actor, details=None):
    entry = {
        "ts": datetime.now().isoformat(timespec="seconds"),
        "action": action,
        "actor": actor,
        "details": details if details is not None else {}
    }
    audit_log = load_data(AUDIT_FILE, default=[])
    audit_log.append(entry)
    save_data(AUDIT_FILE, audit_log)

# --- HTTP Request Handler ---
class SimpleHTTPRequestHandler(http.server.BaseHTTPRequestHandler):
    def _send_response(self, status_code, data, content_type="application/json"):
        self.send_response(status_code)
        self.send_header("Content-type", content_type)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, HEAD")
        self.send_header("Access-Control-Allow-Headers", "X-Requested-With, Content-type")
        self.end_headers()
        if data is not None:
            self.wfile.write(json.dumps(data).encode('utf-8'))

    def do_OPTIONS(self):
        self._send_response(204, None)

    def do_HEAD(self):
        self.send_response(200)
        self.send_header("Content-type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, HEAD")
        self.send_header("Access-Control-Allow-Headers", "X-Requested-With, Content-type")
        self.end_headers()

    def get_post_body(self):
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)
        return json.loads(post_data.decode('utf-8'))

    def do_GET(self):
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        if path == '/stats': self.handle_get_stats()
        elif path == '/enrollments': self.handle_get_enrollments(parsed_path)
        elif path == '/users': self.handle_get_users()
        elif path == '/subjects': self.handle_get_subjects(parsed_path)
        else: self._send_response(404, {"error": "Not Found"})

    def do_POST(self):
        path = urlparse(self.path).path
        if path == '/login': self.handle_login()
        elif path == '/register': self.handle_register()
        elif path == '/enrollments': self.handle_create_enrollment()
        elif path.startswith('/enrollments/') and path.endswith('/action'): self.handle_enrollment_action()
        elif path == '/subjects': self.handle_create_subject()
        else: self._send_response(404, {"error": "Not Found"})
        
    def do_PUT(self):
        path = urlparse(self.path).path
        if path.startswith('/subjects/'): self.handle_update_subject()
        else: self._send_response(404, {"error": "Not Found"})

    def do_DELETE(self):
        path = urlparse(self.path).path
        if path.startswith('/subjects/'): self.handle_delete_subject()
        else: self._send_response(404, {"error": "Not Found"})

    # --- GET Handlers ---
    def handle_get_stats(self):
        users = load_data(USERS_FILE, default=[])
        enrollments = load_data(ENROLLMENTS_FILE, default=[])
        stats = {
            "totalUsers": len(users),
            "teachers": sum(1 for u in users if u.get('role') == 'teacher'),
            "students": sum(1 for u in users if u.get('role') == 'student'),
            "enrollments": len(enrollments),
            "activeSessions": 0, # Placeholder
            "sessionsToday": 0, # Placeholder
        }
        self._send_response(200, stats)

    def handle_get_enrollments(self, parsed_path):
        params = parse_qs(parsed_path.query)
        all_enrollments = load_data(ENROLLMENTS_FILE, default=[])
        all_subjects = load_data(SUBJECTS_FILE, default=[])
        subjects_lookup = {s['id']: s for s in all_subjects}

        if "teacher_usn" in params: all_enrollments = [e for e in all_enrollments if e.get("teacher_usn") == params["teacher_usn"][0]]
        if "student_usn" in params: all_enrollments = [e for e in all_enrollments if e.get("student_usn") == params["student_usn"][0]]
        if "status" in params: all_enrollments = [e for e in all_enrollments if e.get("status", "").lower() == params["status"][0].lower()]

        for e in all_enrollments:
            subject_details = subjects_lookup.get(e.get("subject_id"))
            e["schedules"] = subject_details.get("schedules") if subject_details else []

        self._send_response(200, all_enrollments)
        
    def handle_get_users(self):
        users = [u.copy() for u in load_data(USERS_FILE, default=[])]
        for u in users: u.pop('password', None)
        self._send_response(200, users)
        
    def handle_get_subjects(self, parsed_path):
        params = parse_qs(parsed_path.query)
        subjects = load_data(SUBJECTS_FILE, default=[])
        if "teacher_usn" in params: subjects = [s for s in subjects if s.get("teacher_usn") == params["teacher_usn"][0]]
        self._send_response(200, subjects)

    # --- POST, PUT, DELETE Handlers ---
    def handle_login(self):
        body = self.get_post_body()
        users = load_data(USERS_FILE, default=[])
        user = next((u for u in users if u.get('usn_emp') == body.get('usn') and u.get('password') == body.get('password')), None)
        if user:
            safe_user = user.copy()
            safe_user.pop('password', None)
            self._send_response(200, safe_user)
        else: self._send_response(401, {"error": "Invalid USN or password"})

    def handle_register(self):
        body = self.get_post_body()
        users = load_data(USERS_FILE, default=[])
        if any(u.get('usn_emp') == body.get('usn') for u in users):
            return self._send_response(409, {"error": "User with this USN already exists"})
        body["id"] = str(uuid.uuid4())
        body['usn_emp'] = body.pop('usn')
        users.append(body)
        save_data(USERS_FILE, users)
        safe_body = body.copy()
        safe_body.pop('password', None)
        self._send_response(201, safe_body)

    def handle_create_subject(self):
        body = self.get_post_body()
        body["id"] = str(uuid.uuid4())
        subjects = load_data(SUBJECTS_FILE, default=[])
        subjects.append(body)
        save_data(SUBJECTS_FILE, subjects)
        append_audit("Subject Created", body.get("teacher_usn"), {"subject_name": body.get("name")})
        self._send_response(201, body)

    def handle_update_subject(self):
        subject_id = self.path.split('/')[-1]
        body = self.get_post_body()
        subjects = load_data(SUBJECTS_FILE, default=[])
        actor = body.get("teacher_usn", "unknown")
        
        subject_found = False
        for i, subject in enumerate(subjects):
            if subject.get('id') == subject_id:
                subjects[i] = body # Replace the entire subject object
                subject_found = True
                break
        
        if subject_found:
            save_data(SUBJECTS_FILE, subjects)
            append_audit("Subject Updated", actor, {"subject_id": subject_id, "name": body.get("name")})
            self._send_response(200, body)
        else: self._send_response(404, {"error": "Subject not found"})

    def handle_delete_subject(self):
        subject_id = self.path.split('/')[-1]
        subjects = load_data(SUBJECTS_FILE, default=[])
        actor = parse_qs(urlparse(self.path).query).get('actor', ['unknown'])[0]
        
        subject_to_delete = next((s for s in subjects if s.get('id') == subject_id), None)
        if not subject_to_delete:
            return self._send_response(404, {"error": "Subject not found"})

        subjects_new = [s for s in subjects if s.get('id') != subject_id]
        save_data(SUBJECTS_FILE, subjects_new)
        append_audit("Subject Deleted", actor, {"subject_id": subject_id, "name": subject_to_delete.get("name")})
        self._send_response(204, None)

    def handle_create_enrollment(self):
        body = self.get_post_body()
        all_subjects = load_data(SUBJECTS_FILE, default=[])
        target_subject = next((s for s in all_subjects if s.get("id") == body.get("subject_id")), None)
        if not target_subject: return self._send_response(404, {"error": "Subject not found"})
        
        enrollments = load_data(ENROLLMENTS_FILE, default=[])
        if any(e.get("student_usn") == body.get("student_usn") and e.get("subject_id") == body.get("subject_id") for e in enrollments):
            return self._send_response(409, {"error": "Enrollment already exists or is pending"})

        all_users = load_data(USERS_FILE, default=[])
        student = next((u for u in all_users if u.get("usn_emp") == body.get("student_usn")), {})
        teacher = next((u for u in all_users if u.get("usn_emp") == target_subject.get("teacher_usn")), {})

        new_enrollment = {
            "id": str(uuid.uuid4()),
            "student_usn": student.get("usn_emp"),
            "student_name": student.get("name", "Unknown Student"),
            "subject_id": target_subject.get("id"),
            "subject_name": target_subject.get("name"),
            "teacher_usn": teacher.get("usn_emp"),
            "teacher_name": teacher.get("name", "Unknown Teacher"),
            "status": "Pending",
            "requested_at": datetime.now().isoformat(timespec="seconds"),
        }
        enrollments.append(new_enrollment)
        save_data(ENROLLMENTS_FILE, enrollments)
        append_audit("Enrollment Requested", body.get("student_usn"), {"subject": target_subject.get("name")})
        self._send_response(201, new_enrollment)

    def handle_enrollment_action(self):
        enrollment_id = self.path.strip('/').split('/')[1]
        body = self.get_post_body()
        actor = body.get('actor', 'unknown')
        action = body.get('action') # 'approve' or 'decline'
        
        enrollments = load_data(ENROLLMENTS_FILE, default=[])
        enrollment_found = next((e for e in enrollments if e.get('id') == enrollment_id), None)
        
        if enrollment_found:
            new_status = 'Approved' if action == 'approve' else 'Declined'
            enrollment_found['status'] = new_status
            save_data(ENROLLMENTS_FILE, enrollments)
            append_audit(f"Enrollment {new_status}", actor, {"enrollment_id": enrollment_id})
            self._send_response(200, enrollment_found)
        else: self._send_response(404, {"error": "Enrollment not found"})

# --- Main Execution ---
if __name__ == "__main__":
    # This loop is for local testing and will also work on Render.
    # It ensures the data files and the backend directory exist.
    all_files = [
        (USERS_FILE, []), (ENROLLMENTS_FILE, []), (AUDIT_FILE, []),
        (SUBJECTS_FILE, []), (TEACHERS_FILE, []), (REQUESTS_FILE, []),
        (ATT_FILE, []), (SETTINGS_FILE, {}), (LIBRARY_FILE, []),
        (BORROW_FILE, []), (BORROW_RECORDS_FILE, [])
    ]
    for file, default_content in all_files:
        # The load_data function will handle directory and file creation now
        load_data(file, default=default_content)

    with socketserver.TCPServer(("", PORT), SimpleHTTPRequestHandler) as httpd:
        print(f"Serving at port {PORT}. All data files initialized in '{DATA_DIR}' directory.")
        httpd.serve_forever()
