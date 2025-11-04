from werkzeug.security import generate_password_hash, check_password_hash
from extensions.mongo import mongo

class UserModel:
    collection = mongo.db.users

    @staticmethod
    def find_by_email(email):
        return UserModel.collection.find_one({"email": email})

    @staticmethod
    def create_user(username, email, password):
        hashed_pw = generate_password_hash(password)
        user_data = {"username": username, "email": email, "password": hashed_pw}
        UserModel.collection.insert_one(user_data)
        return user_data

    @staticmethod
    def verify_password(user, password):
        return check_password_hash(user["password"], password)
