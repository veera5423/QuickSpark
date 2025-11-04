from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from extensions.mongo import mongo
from bson import ObjectId

from pymongo import MongoClient
import os

uri = os.getenv("MongoURI", "mongodb://localhost:27017")
client = MongoClient(uri, serverSelectionTimeoutMS=5000)
try:
    print(client.server_info())  # prints server information if connected
    db = client.get_database()   # gets default DB from URI if present
    print("Collections:", db.list_collection_names())
except Exception as e:
    print("Connection failed:", repr(e))



class AuthService:
    @staticmethod
    def register(username, email, password):
        if db.users.find_one({"email": email}):
            return {"error": "Email already exists"}, 400

        hashed_pw = generate_password_hash(password)
        db.users.insert_one({
            "username": username,
            "email": email,
            "password": hashed_pw
        })
        return {"message": "User created successfully"}, 201

    @staticmethod
    def login(email, password):
        user = db.users.find_one({"email": email})
        if not user or not check_password_hash(user["password"], password):
            return {"error": "Invalid credentials"}, 401

        token = create_access_token(identity=str(user["_id"]))
        return {"access_token": token, "username": user["username"]}, 200

    @staticmethod
    def get_profile(user_id):
        user = db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            return {"error": "User not found"}, 404
        return {"username": user["username"], "email": user["email"]}, 200
