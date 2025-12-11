
import http.server
import socketserver
import json
import os
from datetime import datetime
from urllib.parse import urlparse, parse_qs
import uuid # Use for generating unique IDs

# --- Data File Paths ---
USERS_FILE = "users.json"
ENROLLMENTS_FILE = "enrollments.json"
AUDIT_FILE = "audit.json"
LABS_FILE = "labs.json"
ROOMS_FILE = "rooms.json"
BOOKS_FILE = "books.json"

# Get port from environment variable for Render, default to 5000 for local dev
PORT = int(os.environ.get('PORT', 5000))

# --- Helper Functions ---
def load_data(path, default=None):
    if default is None:
        default = []
    if not os.path.exists(path):
        # Create default data if file doesn't exist
        if path == LABS_FILE:
            default = [
                { "id": str(uuid.uuid4()), "name": "Super Lab", "capacity": 40, "pcs": [{ "number": i + 1, "status": "available"} for i in range(40)] },
                { "id": str(uuid.uuid4()), "name": "Computer Lab", "capacity": 40, "pcs": [{ "number": i + 1, "status": "available"} for i in range(40)] },
                { "id": str(uuid.uuid4()), "name": "Internet Lab", "capacity": 20, "pcs": [{ "number": i + 1, "status": "available"} for i in range(20)] },
            ]
            save_data(path, default)
        elif path == ROOMS_FILE:
            default = [
                { "id": str(uuid.uuid4()), "name": "Room 101", "capacity": 30 },
                { "id": str(uuid.uuid4()), "name": "Room 102", "capacity": 35 },
                { "id": str(uuid.uuid4()), "name": "Room 201", "capacity": 40 },
            ]
            save_data(path, default)
        elif path == BOOKS_FILE:
             default = [
                { "id": str(uuid.uuid4()), "title": "The Lord of the Rings", "author": "J.R.R. Tolkien", "copies": 5 },
                { "id": str(uuid.uuid4()), "title": "Pride and Prejudice", "author": "Jane Austen", "copies": 3 }
            ]
             save_data(path, default)
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
    audit_log = load_data(AUDIT_FILE, default=[])
    audit_log.append(entry)
    save_data(AUDIT_FILE, audit_log)

# --- HTTP Request Handler ---
class SimpleHTTPRequestHandler(http.server.BaseHTTPRequestHandler):
    def _send_response(self, status_code, data, content_type="application/json"):
        self.send_response(status_code)
        self.send_header("Content-type", content_type)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, DELETE, PUT")
        self.send_header("Access-Control-Allow-Headers", "X-Requested-With, Content-type, Authorization")
        self.end_headers()
        if data is not None:
            self.wfile.write(json.dumps(data).encode('utf-8'))

    def do_OPTIONS(self):
        self._send_response(204, None)

    def do_GET(self):
        parsed_path = urlparse(self.path)
        path = parsed_path.path

        endpoints = {
            '/enrollments': self.handle_get_enrollments,
            '/users': self.handle_get_users,
            '/labs': lambda p: self._send_response(200, load_data(LABS_FILE)),
            '/rooms': lambda p: self._send_response(200, load_data(ROOMS_FILE)),
            '/books': lambda p: self._send_response(200, load_data(BOOKS_FILE)),
            '/audit': lambda p: self._send_response(200, load_data(AUDIT_FILE, default=[])),
        }

        handler = endpoints.get(path)
        if handler:
            handler(parsed_path)
        else:
            self._send_response(404, {"error": "Not Found"})

    def do_POST(self):
        parsed_path = urlparse(self.path)
        path = parsed_path.path

        endpoints = {
            '/login': self.handle_login,
            '/register': self.handle_register,
            '/labs': self.handle_add_lab,
            '/rooms': self.handle_add_room,
            '/books': self.handle_add_book,
        }
        
        handler = endpoints.get(path)
        if handler:
            handler()
        elif path.startswith('/enrollments/') and path.endswith('/action'):
            self.handle_enrollment_action()
        else:
            self._send_response(404, {"error": "Not Found"})

    # --- GET Handlers ---
    def handle_get_enrollments(self, parsed_path):
        # (Existing implementation)
        pass
        
    def handle_get_users(self, parsed_path):
        users = load_data(USERS_FILE, default=[])
        users_safe = [{k: v for k, v in u.items() if k != 'password'} for u in users]
        self._send_response(200, users_safe)

    # --- POST Handlers ---
    def get_post_body(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        return json.loads(post_data.decode('utf-8'))
    
    def handle_add_lab(self):
        body = self.get_post_body()
        if not all(k in body for k in ['name', 'capacity']):
            self._send_response(400, {"error": "Missing name or capacity"})
            return
        labs = load_data(LABS_FILE)
        new_lab = {
            "id": str(uuid.uuid4()),
            "name": body['name'],
            "capacity": int(body['capacity']),
            "pcs": [{ "number": i + 1, "status": "available"} for i in range(int(body['capacity']))]
        }
        labs.append(new_lab)
        save_data(LABS_FILE, labs)
        self._send_response(201, new_lab)

    def handle_add_room(self):
        body = self.get_post_body()
        if not all(k in body for k in ['name', 'capacity']):
            self._send_response(400, {"error": "Missing name or capacity"})
            return
        rooms = load_data(ROOMS_FILE)
        new_room = {
            "id": str(uuid.uuid4()),
            "name": body['name'],
            "capacity": int(body['capacity'])
        }
        rooms.append(new_room)
        save_data(ROOMS_FILE, rooms)
        self._send_response(201, new_room)

    def handle_add_book(self):
        body = self.get_post_body()
        if not all(k in body for k in ['title', 'author', 'copies']):
            self._send_response(400, {"error": "Missing title, author, or copies"})
            return
        books = load_data(BOOKS_FILE)
        new_book = {
            "id": str(uuid.uuid4()),
            "title": body['title'],
            "author": body['author'],
            "copies": int(body['copies'])
        }
        books.append(new_book)
        save_data(BOOKS_FILE, books)
        self._send_response(201, new_book)

    def handle_login(self):
        # (Existing implementation)
        pass

    def handle_register(self):
        # (Existing implementation)
        pass

    def handle_enrollment_action(self):
        # (Existing implementation)
        pass

# --- Main Execution ---
if __name__ == "__main__":
    # Ensure data files exist with default content if necessary
    load_data(USERS_FILE, default=[])
    load_data(ENROLLMENTS_FILE, default=[])
    load_data(AUDIT_FILE, default=[])
    load_data(LABS_FILE)
    load_data(ROOMS_FILE)
    load_data(BOOKS_FILE)

    with socketserver.TCPServer(("", PORT), SimpleHTTPRequestHandler) as httpd:
        print(f"Serving at port {PORT}")
        httpd.serve_forever()
