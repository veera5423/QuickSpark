from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
from bson import ObjectId
import jwt
import datetime
import os

# =========================
# Flask setup
# =========================
app = Flask(__name__)
CORS(app)  # allow React frontend to connect

app.config['SECRET_KEY'] = "your_secret_key_here"  # use env variable in production

# =========================
# MongoDB setup
# =========================
client = MongoClient("mongodb://localhost:27017/")  # Update if using Atlas
db = client['QuickSparkDB']
users_collection = db['users']

# =========================
# Helper: Encode & Decode JWT
# =========================
def generate_token(user_id):
    """Generate a JWT token"""
    token = jwt.encode({
        'user_id': str(user_id),
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=12)
    }, app.config['SECRET_KEY'], algorithm='HS256')
    return token

def decode_token(token):
    """Decode JWT and return user_id"""
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        return payload['user_id']
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

# =========================
# Routes
# =========================

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    phone = data.get('phone')
    password = data.get('password')

    if not all([username, email, phone, password]):
        return jsonify({'error': 'All fields are required'}), 400

    # check existing user
    if users_collection.find_one({'$or': [{'email': email}, {'phone': phone}]}):
        return jsonify({'error': 'User already exists'}), 409

    hashed_pw = generate_password_hash(password)
    user = {
        'username': username,
        'email': email,
        'phone': phone,
        'password': hashed_pw,
        'created_at': datetime.datetime.utcnow()
    }

    result = users_collection.insert_one(user)
    return jsonify({'message': 'User registered successfully', 'user_id': str(result.inserted_id)}), 201


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    identifier = data.get('identifier')  # email or phone
    password = data.get('password')

    if not identifier or not password:
        return jsonify({'error': 'Email/Phone and password are required'}), 400

    # Check by email or phone
    if '@' in identifier:
        user = users_collection.find_one({'email': identifier})
    else:
        user = users_collection.find_one({'phone': identifier})

    if not user or not check_password_hash(user['password'], password):
        return jsonify({'error': 'Invalid credentials'}), 401

    token = generate_token(user['_id'])
    return jsonify({
        'message': 'Login successful',
        'token': token,
        'user': {
            'id': str(user['_id']),
            'username': user['username'],
            'email': user['email'],
            'phone': user['phone']
        }
    }), 200


@app.route('/protected', methods=['GET'])
def protected():
    """Example protected route"""
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Missing or invalid token'}), 401

    token = auth_header.split(' ')[1]
    user_id = decode_token(token)

    if not user_id:
        return jsonify({'error': 'Invalid or expired token'}), 401

    user = users_collection.find_one({'_id': ObjectId(user_id)}, {'password': 0})
    if not user:
        return jsonify({'error': 'User not found'}), 404

    return jsonify({'message': 'Authorized access', 'user': {
        'id': str(user['_id']),
        'username': user['username'],
        'email': user['email'],
        'phone': user['phone']
    }}), 200


@app.route('/')
def home():
    return jsonify({'message': 'QuickSpark Flask API is running 🚀'})


# =========================
# Run
# =========================
if __name__ == '__main__':
    app.run(debug=True)
