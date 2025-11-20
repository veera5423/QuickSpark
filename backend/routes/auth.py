from flask import Blueprint, request, jsonify, redirect
from services.auth_service import AuthService
from config import Config
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import UserModel


auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    response, status = AuthService.register(username, email, password)

    return jsonify(response), status


@auth_bp.route("/google/login")
def google_login():
    google_url = (
        "https://accounts.google.com/o/oauth2/v2/auth?"
        f"client_id={Config.GOOGLE_CLIENT_ID}"
        "&response_type=code"
        f"&redirect_uri={Config.GOOGLE_REDIRECT_URI}"
        "&scope=openid%20email%20profile"
    )
    return redirect(google_url)


@auth_bp.route("/google/callback")
def google_callback():
    code = request.args.get("code")
    response, status = AuthService.google_oauth(code)
    return jsonify(response), status


@auth_bp.route("/google/login", methods=["POST"])
def google_login_post():
    data = request.get_json()
    token = data.get("token")
    response, status = AuthService.google_login_with_token(token)
    return jsonify(response), status



@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    response, status = AuthService.login(email, password)
    return jsonify(response), status


#to Verify user after registration
@auth_bp.route("/verify-email/<token>",methods=["GET"])
def verify(token):
    response, status = AuthService.verify(token)
    return jsonify(response), status

@auth_bp.route("/resend_verification", methods=["POST"])
def resend_verification():
    data = request.get_json()
    email = data.get("email")

    response, status = AuthService.resend_verification(email)
    return jsonify(response), status

@auth_bp.route("/reset_password/<token>", methods=["GET"])
def verify_reset_token(token):
    response, status = AuthService.verify_reset_token(token)
    return jsonify(response), status

@auth_bp.route("/reset_password/<token>", methods=["POST"])
def reset_password(token):
    data = request.get_json()
    password = data.get("password")

    response, status = AuthService.reset_password_with_token(token, password)
    return jsonify(response), status

@auth_bp.route("/forgot_password", methods=["POST"])
def forgot_password():
    data = request.get_json()
    email = data.get("email")

    response, status = AuthService.forgot_password(email)
    return jsonify(response), status

@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def get_current_user():
    user_id = get_jwt_identity()
    user = UserModel.find_by_id(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
    return jsonify({
        "id": str(user["_id"]),
        "username": user["username"],
        "email": user["email"],
        "is_admin": user.get("is_admin", False),
        "is_premium": user.get("is_premium", False)
    }), 200
    