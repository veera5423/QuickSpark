from models.user import UserModel
from flask_jwt_extended import create_access_token
from datetime import timedelta

class AuthService:
    @staticmethod
    def register(username, email, password):
        if UserModel.find_by_email(email):
            return {"message": "Email already exists"}, 400

        UserModel.create_user(username, email, password)
        return {"message": "User registered successfully"}, 201

    @staticmethod
    def login(email, password):
        user = UserModel.find_by_email(email)
        if not user or not UserModel.verify_password(user, password):
            return {"message": "Invalid credentials"}, 401

        token = create_access_token(identity=str(user["_id"]), expires_delta=timedelta(hours=1))
        return {"access_token": token, "username": user["username"]}, 200
