from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from datetime import datetime

DATA_DIR = "." 
USERS_FILE = os.path.join(DATA_DIR, "users.json")
TEACHERS_FILE = os.path.join(DATA_DIR, "teachers.json")
REQUESTS_FILE = os.path.join(DATA_DIR, "requests.json")
ATT_FILE = os.path.join(DATA_DIR, "attendance.json")
ENROLLMENTS_FILE = os.path.join(DATA_DIR, "enrollments.json")
AUDIT_FILE = os.path.join(DATA_DIR, "audit.json")
SETTINGS_FILE = os.path.join(DATA_DIR, "settings.json")
LIBRARY_FILE = os.path.join(DATA_DIR, "library.json")
BORROW_FILE = os.path.join(DATA_DIR, "borrow_requests.json")
BORROW_RECORDS_FILE = os.path.join(DATA_DIR, "borrow_records.json")

app = Flask(__name__)
CORS(app) 
def load(path, default):
    if not os.path.exists(path):
        with open(path, "w", encoding="utf-8") as f:
            json.dump(default, f, indent=4)
        return default
    with open(path, "r", encoding="utf-8") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return default

def save(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)

def append_audit(action, actor, details=None):
    try:
        if details is None:
            details = {}
        entry = {
            "ts": datetime.now().isoformat(timespec="seconds"),
            "action": action,
            "actor": actor,
            "details": details
        }
        arr = load(AUDIT_FILE, [])
        arr.append(entry)
        save(AUDIT_FILE, arr)
    except Exception as e:
        print(f"Error appending to audit log: {e}")

@app.route("/")
def index():
    return jsonify({"message": "Welcome to the AMA Lab System Backend!"})

@app.route('/api/login', methods=['POST'])
def handle_login():
    data = request.get_json()
    usn = data.get('usn')
    pwd = data.get('password')

    if not usn or not pwd:
        return jsonify({"error": "Please provide USN and password."}), 400

    users = load(USERS_FILE, {})
    user_data = users.get(usn)

    if not user_data or user_data.get("password") != pwd:
        append_audit("Login Failed", usn, {"reason": "Invalid credentials"})
        return jsonify({"error": "Invalid credentials."}), 401

    append_audit("Login Success", usn, {"role": user_data.get("role")})
  
    return jsonify({
        "message": f"Welcome, {user_data.get('name')}",
        "user": {
            "usn": usn,
            "name": user_data.get("name"),
            "role": user_data.get("role"),
            "email": user_data.get("email"),
        }
    })

@app.route('/api/signup', methods=['POST'])
def handle_signup():
    data = request.get_json()
    usn = data.get('usn')
    name = data.get('name')
    email = data.get('email')
    pwd = data.get('password')

    if not usn or not name or not email or not pwd:
        return jsonify({"error": "Please fill out all fields."}), 400

    users = load(USERS_FILE, {})

    if usn in users:
        return jsonify({"error": "USN already exists."}), 409

    users[usn] = {
        "name": name,
        "email": email,
        "password": pwd,
        "role": "student" 
    }

    save(USERS_FILE, users)
    append_audit("Signup Success", usn, {"role": "student"})

    return jsonify({"message": "Signup successful! You can now log in."})


# --- Main execution ---
if __name__ == '__main__':
    if not os.path.exists(USERS_FILE):
        save(USERS_FILE, {
             "admin": {"name": "Administrator", "email": "admin@amacc_lipa.com", "password": "admin123", "role": "admin"},
             "library": {"name": "Library Manager", "email": "library@amacc_lipa.com", "password": "library123", "role": "library_admin"}
        })
    app.run(host='0.0.0.0', port=5001, debug=True)
