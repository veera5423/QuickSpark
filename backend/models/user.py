from werkzeug.security import generate_password_hash, check_password_hash
from db.mongo_client import db

class UserModel:
    @staticmethod
    def find_by_email(email):
        return db.users.find_one({"email": email})

    @staticmethod
    def create_user(username, email, password):
        hashed_pw = generate_password_hash(password)
        new_user = {
            "username": username,
            "email": email,
            "password": hashed_pw
        }
        db.users.insert_one(new_user)
        return new_user

    @staticmethod
    def verify_password(user, password):
        return check_password_hash(user["password"], password)
