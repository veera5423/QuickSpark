from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from db.mongo_client import db
from bson import ObjectId

class UserModel:
    @staticmethod
    def find_by_email(email):
        return db.users.find_one({"email": email})

    @staticmethod
    def create_user(username, email, password, gender, auth_provider="local", is_verified=False):
        new_user = {
            "username": username,
            "email": email,
            "gender": gender,
            "password": generate_password_hash(password) if password else None,
            "is_verified": is_verified,
            "auth_provider": auth_provider,
            "created_at": datetime.utcnow()
        }
        userid = db.users.insert_one(new_user).inserted_id
        new_user["_id"] = str(userid)
        return new_user

    @staticmethod
    def verify_password(user, password):
        return check_password_hash(user["password"], password)
    
    @staticmethod
    def find_by_id(user_id):
        user = db.users.find_one({"_id": ObjectId(user_id)})
        if user:
            user["_id"] = str(user["_id"])  # Convert ObjectId to string
        return user
    

    @staticmethod
    def update_verification_status(user_id, status):
        result = db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"is_verified": status}}
        )
        return result.modified_count > 0
    
    @staticmethod
    def update_password(user_id, new_password):
        hashed_pw = generate_password_hash(new_password)
        result = db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"password": hashed_pw}}
        )
        return result.modified_count > 0
