
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  
users = {
    "marvin": {
        "role": "admin",
        "password": "123"
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

@app.route('/', methods=['GET'])
def health_check():
    return jsonify({"status": "ok"}), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8080)
