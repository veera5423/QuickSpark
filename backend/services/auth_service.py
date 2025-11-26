

from config import Config
import requests

from models.user import UserModel
from flask_jwt_extended import create_access_token, decode_token
from datetime import timedelta
from utils.sendgrid_helper import send_email_sendgrid
from werkzeug.security import generate_password_hash


class AuthService:

    @staticmethod
    def google_oauth(code):

        # Exchange authorization code for access token
        token_url = "https://oauth2.googleapis.com/token"
        token_data = {
            "code": code,
            "client_id": Config.GOOGLE_CLIENT_ID,
            "client_secret": Config.GOOGLE_CLIENT_SECRET,
            "redirect_uri": Config.GOOGLE_REDIRECT_URI,
            "grant_type": "authorization_code",
        }

        token_response = requests.post(token_url, data=token_data).json()
        access_token = token_response.get("access_token")

        if not access_token:
            return {"message": "Google token exchange failed"}, 400

        # Get user info
        user_info = requests.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token}"}
        ).json()

        email = user_info["email"]
        name = user_info.get("name", "Google User")

        # Check if user already exists
        user = UserModel.find_by_email(email)

        if not user:
            new_user = {
                "email": email,
                "username": name,
                "password": None,
                "is_verified": True,
                "auth_provider": "google"
            }
            user_id = UserModel.create_user(**new_user)
        else:
            user_id = user["_id"]

        # Create JWT token
        jwt_token = create_access_token(identity=str(user_id))

        return {
            "message": "Login successful",
            "token": jwt_token,
            "user": {
                "email": email,
                "username": name,
                "id": str(user_id),
            }
        }, 200



    @staticmethod
    def register(username, email, password, gender):
        if UserModel.find_by_email(email):
            return {"message": "Email already exists"}, 400

        user=UserModel.create_user(username, email, password, gender)
        print(f"User created with ID: {user['_id']}")
        token = create_access_token(identity=str(user["_id"]), expires_delta=timedelta(days=1))
        verify_link = f"https://quick-spark.vercel.app/verify-email/{token}"

        html = f"""
            <h2>Verify your email</h2>
            <p>Click below to verify your account:</p>
            <a href="{verify_link}">Verify Email</a>
        """
        



        send_email_sendgrid(email, "Verify Your Email", html)        
        

        return {"message": "Registered successfully. Check your email or spam to verify your account."}, 200
        

    @staticmethod
    def login(email, password):
        user = UserModel.find_by_email(email)
        if not user or not UserModel.verify_password(user, password):
            return {"message": "Invalid credentials"}, 401
        if not user.get("is_verified"):
            return {"message": "Email not verified. Please check your email."}, 403

        token = create_access_token(identity=str(user["_id"]), expires_delta=timedelta(hours=2))
        return {"access_token": token, "username": user["username"]}, 200
    
    @staticmethod
    def verify(token):
        user_id = decode_token(token)["sub"]
        if not user_id:
            return {"message": "Invalid or expired token"}, 400

        user = UserModel.find_by_id(user_id)
        if not user:
            return {"message": "User not found"}, 404

        if user.get("is_verified"):
            return {"message": "User already verified"}, 200

        UserModel.update_verification_status(user_id, True)
        return {"message": "Email verified successfully"}, 200
    
    @staticmethod
    def forgot_password(email):
        user = UserModel.find_by_email(email)
        if not user:
            return {"message": "User not found"}, 404

        token = create_access_token(identity=str(user["_id"]), expires_delta=timedelta(hours=1))
        reset_link = f"https://quick-spark.vercel.app/reset-password/{token}"

        html = f"""     
            <h2>Password Reset</h2>
            <p>Click the link below to reset your password:</p>
            <a href="{reset_link}" 
           style="background:#4CAF50; padding:10px 18px; color:white; text-decoration:none; border-radius:5px;">
           Reset Password
            </a>
            <p>This link expires in 1 hour.</p>
        """

        send_email_sendgrid(email, "Reset Your Password", html)
        return {"message": "Password reset link sent to your email"}, 200
    
    @staticmethod
    def verify_reset_token(token):
        try:
            user_id = decode_token(token)["sub"]
            if not user_id:
                return {"message": "Invalid or expired token"}, 400
            user = UserModel.find_by_id(user_id)
            if not user:
                return {"message": "User not found"}, 404
            return {"message": "Token valid"}, 200
        except Exception as e:
            return {"message": "Invalid or expired token"}, 400

    @staticmethod
    def reset_password_with_token(token, new_password):
        user_id = decode_token(token)["sub"]
        if not user_id:
            return {"message": "Invalid or expired token"}, 400
        user = UserModel.find_by_id(user_id)
        if not user:
            return {"message": "User not found"}, 404

        result = UserModel.update_password(user_id, new_password)
        if not result:
            return {"message": "Failed to update password"}, 500
        return {"message": "Password updated successfully"}, 200
#--------------
    @staticmethod
    def google_login_with_token(token):
        import google.auth.transport.requests
        from google.oauth2 import id_token

        try:
            # Verify the token
            idinfo = id_token.verify_oauth2_token(token, google.auth.transport.requests.Request(), Config.GOOGLE_CLIENT_ID)

            email = idinfo['email']
            name = idinfo.get('name', 'Google User')

            # Check if user already exists
            user = UserModel.find_by_email(email)

            if not user:
                user_id = UserModel.create_user(name, email, None, "google", True)
            else:
                user_id = user["_id"]

            # Create JWT token
            jwt_token = create_access_token(identity=str(user_id))

            return {
                "access_token": jwt_token,
                "username": name
            }, 200

        except ValueError:
            return {"message": "Invalid token"}, 400
