from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Dummy user data (replace with a real database)
# This is a simple in-memory dictionary. Data will be lost if the server restarts.
users = {
    "marvin": {
        "role": "admin",
        "password": "123"  # In a real app, use hashed passwords!
    }
}

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = users.get(username)

    if user and user['password'] == password:
        return jsonify({"message": "Login successful", "role": user['role']})
    else:
        return jsonify({"message": "Invalid credentials"}), 401

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('usn') # Frontend sends 'usn' as the key
    password = data.get('password')
    name = data.get('name')
    role = data.get('role')

    if not all([username, password, name, role]):
        return jsonify({"message": "Missing required fields"}), 400

    if username in users:
        return jsonify({"message": "User already exists"}), 409 # 409 is the status code for Conflict

    users[username] = {
        "password": password,
        "role": role,
        "name": name
    }
    
    # In a real app, you would save this to a persistent database.
    print(f"New user registered: {username}, Role: {role}. Total users: {len(users)}")

    return jsonify({"message": "Registration successful", "user": {"usn": username, "role": role, "name": name}}), 201

@app.route('/', methods=['GET'])
def health_check():
    return jsonify({"status": "ok"}), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8080)
