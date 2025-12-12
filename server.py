
import http.server
import socketserver
import json
import os
import mimetypes
from datetime import datetime
from urllib.parse import urlparse, parse_qs
import uuid

# --- Firebase Admin SDK Integration ---
import firebase_admin
from firebase_admin import credentials, firestore

SECRET_FILE_PATH = "/etc/secrets/google_credentials.json"

try:
    if os.path.exists(SECRET_FILE_PATH):
        print(f"--- Found credential file at: {SECRET_FILE_PATH} ---")
        cred = credentials.Certificate(SECRET_FILE_PATH)
    else:
        print("--- Secret file not found, attempting to use Application Default Credentials. ---")
        cred = credentials.ApplicationDefault()

    firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("--- Successfully connected to Firebase Firestore. ---")

except Exception as e:
    print(f"--- FATAL: Failed to connect to Firebase. Check credentials and file path. Error: {e} ---")
    exit()

# --- Firestore Collection Names ---
USERS_COLLECTION = "users"
ENROLLMENTS_COLLECTION = "enrollments"
AUDIT_COLLECTION = "audit"
SUBJECTS_COLLECTION = "subjects"
TEACHERS_COLLECTION = "teachers"
REQUESTS_COLLECTION = "requests"
ATTENDANCE_COLLECTION = "attendance"
SETTINGS_COLLECTION = "settings"
LIBRARY_COLLECTION = "library"
BORROW_REQUESTS_COLLECTION = "borrow_requests"
BORROW_RECORDS_COLLECTION = "borrow_records"
E1_COLLECTION = "e1"

PORT = int(os.environ.get('PORT', 8000))
STATIC_DIR = 'dist'

# --- Firestore Helper Functions ---
def query_collection(collection_name, conditions=None):
    query = db.collection(collection_name)
    if conditions:
        for field, op, value in conditions:
            query = query.where(field, op, value)
    return [doc.to_dict() for doc in query.stream()]

def get_all_from_collection(collection_name):
    return [doc.to_dict() for doc in db.collection(collection_name).stream()]

def get_document(collection_name, doc_id):
    doc = db.collection(collection_name).document(doc_id).get()
    return doc.to_dict() if doc.exists else None

def add_or_update_document(collection_name, data, doc_id):
    db.collection(collection_name).document(doc_id).set(data)
    return data

def delete_document(collection_name, doc_id):
    db.collection(collection_name).document(doc_id).delete()

def append_audit(action, actor, details=None):
    entry = {
        "id": str(uuid.uuid4()),
        "ts": datetime.now().isoformat(timespec="seconds"),
        "action": action,
        "actor": actor,
        "details": details if details is not None else {}
    }
    add_or_update_document(AUDIT_COLLECTION, entry, entry["id"])

# --- HTTP Request Handler (Serves API and Static Files) ---
class ComprehensiveRequestHandler(http.server.BaseHTTPRequestHandler):

    def _send_response(self, status_code, data, content_type="application/json"):
        self.send_response(status_code)
        self.send_header("Content-type", content_type)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type")
        self.end_headers()
        if data is not None:
            self.wfile.write(json.dumps(data).encode('utf-8'))

    def do_OPTIONS(self):
        self._send_response(204, None)

    def do_HEAD(self):
        self.send_response(200)
        self.end_headers()

    def get_post_body(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            return json.loads(post_data.decode('utf-8'))
        except (json.JSONDecodeError, ValueError):
            return None

    def do_GET(self):
        # API Routes
        if self.path.startswith('/api/'):
            path = self.path.split("?")[0]
            if path == '/api/users': self.handle_get_users()
            elif path == '/api/subjects': self.handle_get_subjects()
            elif path == '/api/enrollments': self.handle_get_enrollments()
            else: self._send_response(404, {"error": f"GET endpoint for {path} not found"})
            return

        # Static File Serving
        try:
            requested_path = self.path.lstrip('/')
            if requested_path == '' or not os.path.exists(os.path.join(STATIC_DIR, requested_path)):
                requested_path = 'index.html'

            file_path = os.path.join(STATIC_DIR, requested_path)
            
            # Security: Ensure the path is within the static directory
            if not os.path.abspath(file_path).startswith(os.path.abspath(STATIC_DIR)):
                 raise FileNotFoundError

            mime_type, _ = mimetypes.guess_type(file_path)
            self.send_response(200)
            self.send_header('Content-type', mime_type or 'application/octet-stream')
            self.end_headers()
            with open(file_path, 'rb') as f:
                self.wfile.write(f.read())
        except FileNotFoundError:
            self._send_response(404, {"error": "File Not Found"})
        except Exception as e:
            self._send_response(500, {"error": str(e)})


    def do_POST(self):
        path = self.path
        if not path.startswith('/api/'):
            return self._send_response(404, {"error": "POST endpoint not found"})
        
        path = path[4:] # strip /api
        if path == '/login': self.handle_login()
        elif path == '/register': self.handle_register()
        elif path == '/subjects': self.handle_create_subject()
        elif path == '/enrollments': self.handle_create_enrollment()
        elif path.startswith('/enrollments/') and path.endswith('/action'): self.handle_enrollment_action()
        else: self._send_response(404, {"error": "POST endpoint not found"})

    def do_PUT(self):
        path = self.path
        if not path.startswith('/api/'):
            return self._send_response(404, {"error": "PUT endpoint not found"})

        path = path[4:] # strip /api
        if path.startswith('/subjects/'): self.handle_update_subject()
        else: self._send_response(404, {"error": "PUT endpoint not found"})

    def do_DELETE(self):
        path = self.path
        if not path.startswith('/api/'):
            return self._send_response(404, {"error": "DELETE endpoint not found"})

        path = path[4:] # strip /api
        if path.startswith('/subjects/'): self.handle_delete_subject()
        else: self._send_response(404, {"error": "DELETE endpoint not found"})

    # --- USER HANDLERS ---
    def handle_get_users(self):
        users = get_all_from_collection(USERS_COLLECTION)
        for u in users: u.pop('password', None)
        self._send_response(200, users)

    def handle_login(self):
        body = self.get_post_body()
        if not body: return self._send_response(400, {"error": "Invalid request body"})
        user_list = query_collection(USERS_COLLECTION, [
            ('usn_emp', '==', body.get('usn')),
            ('password', '==', body.get('password'))
        ])
        if user_list:
            user = user_list[0]
            user.pop('password', None)
            self._send_response(200, user)
        else:
            self._send_response(401, {"error": "Invalid USN or password"})

    def handle_register(self):
        body = self.get_post_body()
        if not body: return self._send_response(400, {"error": "Invalid request body"})
        if query_collection(USERS_COLLECTION, [('usn_emp', '==', body.get('usn'))]):
             return self._send_response(409, {"error": "User with this USN already exists"})
        user_id = str(uuid.uuid4())
        new_user = {
            "id": user_id,
            "usn_emp": body.get("usn"),
            "name": body.get("name"),
            "password": body.get("password"),
            "role": body.get("role")
        }
        add_or_update_document(USERS_COLLECTION, new_user, user_id)
        safe_user = {k: v for k, v in new_user.items() if k != 'password'}
        self._send_response(201, safe_user)

    # --- SUBJECT HANDLERS ---
    def handle_get_subjects(self):
        params = parse_qs(urlparse(self.path).query)
        teacher_usn = params.get("teacher_usn", [None])[0]
        subjects = query_collection(SUBJECTS_COLLECTION, [('teacher_usn', '==', teacher_usn)]) if teacher_usn else get_all_from_collection(SUBJECTS_COLLECTION)
        self._send_response(200, subjects)

    def handle_create_subject(self):
        body = self.get_post_body()
        if not body: return self._send_response(400, {"error": "Invalid request body"})
        subject_id = str(uuid.uuid4())
        body['id'] = subject_id
        add_or_update_document(SUBJECTS_COLLECTION, body, subject_id)
        append_audit("Subject Created", body.get("teacher_usn"), {"subject_id": subject_id, "name": body.get("name")})
        self._send_response(201, body)

    def handle_update_subject(self):
        subject_id = self.path.split('/')[-1]
        body = self.get_post_body()
        if not body: return self._send_response(400, {"error": "Invalid request body"})
        body['id'] = subject_id
        add_or_update_document(SUBJECTS_COLLECTION, body, subject_id)
        append_audit("Subject Updated", body.get("teacher_usn", "unknown"), {"subject_id": subject_id})
        self._send_response(200, body)

    def handle_delete_subject(self):
        subject_id = self.path.split('/')[-1]
        actor = parse_qs(urlparse(self.path).query).get('actor', ['unknown'])[0]
        subject = get_document(SUBJECTS_COLLECTION, subject_id)
        if not subject:
            return self._send_response(404, {"error": "Subject not found"})
        delete_document(SUBJECTS_COLLECTION, subject_id)
        append_audit("Subject Deleted", actor, {"subject_id": subject_id, "name": subject.get("name")})
        self._send_response(204, None)

    # --- ENROLLMENT HANDLERS ---
    def handle_get_enrollments(self):
        params = parse_qs(urlparse(self.path).query)
        conditions = []
        if "teacher_usn" in params: conditions.append(("teacher_usn", "==", params["teacher_usn"][0]))
        if "student_usn" in params: conditions.append(("student_usn", "==", params["student_usn"][0]))
        if "status" in params: conditions.append(("status", "==", params["status"][0].capitalize()))
        self._send_response(200, query_collection(ENROLLMENTS_COLLECTION, conditions))

    def handle_create_enrollment(self):
        body = self.get_post_body()
        if not body: return self._send_response(400, {"error": "Invalid request body"})
        subject = get_document(SUBJECTS_COLLECTION, body.get("subject_id"))
        if not subject: return self._send_response(404, {"error": "Subject not found"})
        
        existing = query_collection(ENROLLMENTS_COLLECTION, [
            ("student_usn", "==", body.get("student_usn")),
            ("subject_id", "==", body.get("subject_id"))
        ])
        if existing and existing[0].get("status") != "Declined":
            return self._send_response(409, {"error": "Enrollment already exists or is pending"})

        enrollment_id = str(uuid.uuid4())
        student = query_collection(USERS_COLLECTION, [("usn_emp", "==", body.get("student_usn"))])
        new_enrollment = {
            "id": enrollment_id,
            "student_usn": body.get("student_usn"),
            "student_name": student[0].get("name", "N/A") if student else "N/A",
            "subject_id": subject.get("id"),
            "subject_name": subject.get("name"),
            "teacher_usn": subject.get("teacher_usn"),
            "status": "Pending",
            "requested_at": datetime.now().isoformat(timespec="seconds"),
        }
        add_or_update_document(ENROLLMENTS_COLLECTION, new_enrollment, enrollment_id)
        append_audit("Enrollment Requested", body.get("student_usn"), {"subject": subject.get("name")})
        self._send_response(201, new_enrollment)

    def handle_enrollment_action(self):
        enrollment_id = self.path.strip('/').split('/')[1]
        body = self.get_post_body()
        if not body or "action" not in body:
            return self._send_response(400, {"error": "Invalid request body or missing 'action'"})

        enrollment = get_document(ENROLLMENTS_COLLECTION, enrollment_id)
        if not enrollment:
            return self._send_response(404, {"error": "Enrollment not found"})

        action = body.get('action')
        new_status = 'Approved' if action == 'approve' else 'Declined'
        db.collection(ENROLLMENTS_COLLECTION).document(enrollment_id).update({"status": new_status})
        enrollment['status'] = new_status
        append_audit(f"Enrollment {new_status}", body.get('actor', 'unknown'), {"enrollment_id": enrollment_id})
        self._send_response(200, enrollment)

# --- Main Execution ---
if __name__ == "__main__":
    with socketserver.TCPServer(("", PORT), ComprehensiveRequestHandler) as httpd:
        print(f"--- Server starting on port {PORT}. Serving from '{STATIC_DIR}' and providing API. ---")
        httpd.serve_forever()
