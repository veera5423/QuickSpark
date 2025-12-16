from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId, errors
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
            "status": "pending",
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

@user_requests_bp.route("/get-user-requests", methods=["OPTIONS"])
def get_user_requests_options():
    return jsonify({}), 200

@user_requests_bp.route("/user-requests/<request_id>/resolve", methods=["OPTIONS"])
def resolve_user_request_options():
    return jsonify({}), 200




@user_requests_bp.route("/get-user-requests", methods=["GET",], provide_automatic_options=False)
@jwt_required()
def get_user_requests():
    """Admin retrieves all user requests for Pro access."""
    try:
        current_user_id = get_jwt_identity()
        user_obj_id = ObjectId(current_user_id)

        user_doc = users_collection.find_one({"_id": user_obj_id}, {"is_admin": 1})
        if not user_doc or not user_doc.get("is_admin", False):
            return jsonify({"message": "Unauthorized"}), 403

        requests_cursor = list(db.pro_requests.find().sort("created_at", -1))

        # Hydrate with latest user info (email, pro status)
        user_ids = {req.get("user_id") for req in requests_cursor if req.get("user_id")}
        users_map = {
            doc["_id"]: {
                "email": doc.get("email"),
                "is_pro_member": doc.get("is_pro_member", False),
                "name": doc.get("name") or doc.get("username"),
            }
            for doc in users_collection.find({"_id": {"$in": list(user_ids)}}, {"email": 1, "is_pro_member": 1, "name": 1, "username": 1})
        }

        requests_list = []
        for req in requests_cursor:
            user_meta = users_map.get(req.get("user_id"), {})
            req["email"] = req.get("email") or user_meta.get("email")
            req["is_pro_member"] = bool(user_meta.get("is_pro_member", False))
            if not req.get("name"):
                req["name"] = user_meta.get("name")
            req["_id"] = str(req["_id"])
            req["user_id"] = str(req["user_id"])
            req["created_at"] = req["created_at"].isoformat() + "Z"
            if req.get("resolved_at"):
                req["resolved_at"] = req["resolved_at"].isoformat() + "Z"
            if req.get("resolved_by"):
                req["resolved_by"] = str(req["resolved_by"])
            requests_list.append(req)

        return jsonify({"requests": requests_list}), 200
    except Exception as e:
        print(f"Error retrieving pro requests: {e}")
        return jsonify({"message": f"Server error: {str(e)}"}), 500


@user_requests_bp.route("/user-requests/<request_id>/resolve", methods=["POST"], provide_automatic_options=False)
@jwt_required()
def resolve_user_request(request_id):
    """Admin marks a Pro request as approved or rejected and optionally upgrades user."""
    try:
        current_user_id = get_jwt_identity()
        admin_obj_id = ObjectId(current_user_id)

        admin_doc = users_collection.find_one({"_id": admin_obj_id}, {"is_admin": 1})
        if not admin_doc or not admin_doc.get("is_admin", False):
            return jsonify({"message": "Unauthorized"}), 403

        data = request.get_json() or {}
        action = data.get("action", "approve")
        notes = data.get("notes", "")

        if action not in ["approve", "reject"]:
            return jsonify({"message": "Invalid action"}), 400

        try:
            request_obj_id = ObjectId(request_id)
        except errors.InvalidId:
            return jsonify({"message": "Invalid request id"}), 400

        req_doc = db.pro_requests.find_one({"_id": request_obj_id})
        if not req_doc:
            return jsonify({"message": "Request not found"}), 404

        updates = {
            "status": "approved" if action == "approve" else "rejected",
            "resolved_at": datetime.utcnow(),
            "resolved_by": admin_obj_id,
            "notes": notes
        }

        if action == "approve":
            users_collection.update_one(
                {"_id": req_doc["user_id"]},
                {"$set": {"is_pro_member": True}}
            )

        db.pro_requests.update_one({"_id": request_obj_id}, {"$set": updates})

        # Notify requester about the decision when we have their email
        requester_email = req_doc.get("email")
        if not requester_email and req_doc.get("user_id"):
            user_lookup = users_collection.find_one({"_id": req_doc.get("user_id")}, {"email": 1})
            requester_email = user_lookup.get("email") if user_lookup else None

        if requester_email:
            decision = "approved" if action == "approve" else "rejected"
            subject = f"Your Pro access request was {decision}"
            html_parts = [
                f"<p>Hi {req_doc.get('name') or 'there'},</p>",
                f"<p>Your request for Pro access was <strong>{decision}</strong>.</p>"
            ]
            if action == "approve":
                html_parts.append("<p>Your account has been upgraded to Pro. You can start using Pro features right away.</p>")
            else:
                html_parts.append("<p>You can reply with more details and re-apply if needed.</p>")
            if notes:
                html_parts.append(f"<p><strong>Admin note:</strong> {notes}</p>")
            html_parts.append("<p>Thanks for using QuickSpark.</p>")

            try:
                send_email_sendgrid(requester_email, subject, "".join(html_parts))
            except Exception as mail_err:
                print(f"Failed to send requester notification email: {mail_err}")

        return jsonify({"message": f"Request {updates['status']}."}), 200

    except Exception as e:
        print(f"Error resolving pro request: {e}")
        return jsonify({"message": f"Server error: {str(e)}"}), 500




