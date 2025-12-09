from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from datetime import datetime

from db.mongo_client import db, users_collection
from utils.sendgrid_helper import send_email_sendgrid

user_requests_bp = Blueprint("user_requests", __name__)


@user_requests_bp.before_request
def _handle_options_preflight():
    # Ensure OPTIONS preflight requests do not require authentication
    from flask import request
    if request.method == 'OPTIONS':
        return jsonify({}), 200


@user_requests_bp.route("/request-pro", methods=["POST"], provide_automatic_options=False)
@jwt_required()
def request_pro():
    """User requests Pro access — record request and notify admins."""
    try:
        current_user_id = get_jwt_identity()
        user_obj_id = ObjectId(current_user_id)
        data = request.get_json() or {}
        message = data.get("message", "")

        user_doc = users_collection.find_one({"_id": user_obj_id}, {"email": 1, "name": 1})
        user_email = user_doc.get("email") if user_doc else None
        user_name = user_doc.get("name") if user_doc else None

        # Record request
        req_doc = {
            "user_id": user_obj_id,
            "email": user_email,
            "name": user_name,
            "message": message,
            "created_at": datetime.utcnow()
        }
        db.pro_requests.insert_one(req_doc)

        # Notify admins
        admins_cursor = users_collection.find({"is_admin": True}, {"email": 1})
        subject = f"Pro access request from {user_email or 'a user'}"
        html = f"""
        <p>Admin,</p>
        <p>User <strong>{user_name or user_email or current_user_id}</strong> has requested Pro access.</p>
        <p>Message: {message}</p>
        <p>Review the request in the admin panel.</p>
        """
        for admin in admins_cursor:
            admin_email = admin.get("email")
            if admin_email:
                try:
                    send_email_sendgrid(admin_email, subject, html)
                except Exception as e:
                    print(f"Failed to send pro request email to {admin_email}: {e}")

        return jsonify({"message": "Pro request recorded. Admins notified."}), 201
    except Exception as e:
        print(f"Error recording pro request: {e}")
        return jsonify({"message": f"Server error: {str(e)}"}), 500


# CORS preflight handler (no auth required)
@user_requests_bp.route("/request-pro", methods=["OPTIONS"])
def request_pro_options():
    return jsonify({}), 200




