from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from functools import wraps
from db.mongo_client import users_collection
from services.notification_service import (
    send_notification_to_all_users,
    build_announcement_html,
    build_feature_update_html
)

notification_bp = Blueprint("notifications", __name__)


def admin_required(fn):
    """Decorator to check if the current user is an admin."""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            current_user_id = get_jwt_identity()
            admin_user = users_collection.find_one(
                {"_id": ObjectId(current_user_id)},
                {"is_admin": 1}
            )
            if not admin_user or not admin_user.get('is_admin', False):
                return jsonify({"message": "Admin privileges required."}), 403
            return fn(*args, **kwargs)
        except Exception as e:
            return jsonify({"message": "Authentication error."}), 401
    return wrapper


@notification_bp.route("/send-announcement", methods=["POST"])
@jwt_required()
@admin_required
def send_announcement():
    """
    Send a general announcement to all users (or only verified users).
    
    Request body:
    {
        "title": "Announcement title",
        "body": "HTML or plain text body content",
        "cta_text": "Optional button text",
        "cta_link": "Optional button URL",
        "only_verified": false
    }
    """
    data = request.get_json()
    title = data.get("title", "Announcement")
    body = data.get("body", "")
    cta_text = data.get("cta_text")
    cta_link = data.get("cta_link")
    only_verified = data.get("only_verified", False)

    if not body:
        return jsonify({"message": "Body content is required."}), 400

    # Build the HTML email template
    html_content = build_announcement_html(
        title=title,
        body=body,
        cta_text=cta_text,
        cta_link=cta_link
    )

    subject = f"📢 {title} - QuickSpark"

    try:
        result = send_notification_to_all_users(
            subject=subject,
            html_content=html_content,
            only_verified=only_verified
        )
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"message": f"Failed to send notifications: {str(e)}"}), 500


@notification_bp.route("/send-feature-update", methods=["POST"])
@jwt_required()
@admin_required
def send_feature_update():
    """
    Send a feature update notification to all users.
    
    Request body:
    {
        "feature_name": "Study Rooms",
        "description": "Description of the feature...",
        "benefits": ["Benefit 1", "Benefit 2"],
        "cta_text": "Try it now",
        "cta_link": "https://...",
        "only_verified": true
    }
    """
    data = request.get_json()
    feature_name = data.get("feature_name", "New Feature")
    description = data.get("description", "")
    benefits = data.get("benefits", [])
    cta_text = data.get("cta_text")
    cta_link = data.get("cta_link")
    only_verified = data.get("only_verified", True)

    if not description:
        return jsonify({"message": "Description is required."}), 400

    # Build the feature update HTML template
    html_content = build_feature_update_html(
        feature_name=feature_name,
        description=description,
        benefits=benefits,
        cta_text=cta_text,
        cta_link=cta_link
    )

    subject = f"🚀 New Feature: {feature_name} is now available on QuickSpark!"

    try:
        result = send_notification_to_all_users(
            subject=subject,
            html_content=html_content,
            only_verified=only_verified
        )
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"message": f"Failed to send notifications: {str(e)}"}), 500


@notification_bp.route("/preview-feature-update", methods=["POST"])
@jwt_required()
@admin_required
def preview_feature_update():
    """
    Preview the HTML content of a feature update email without sending it.
    """
    data = request.get_json()
    feature_name = data.get("feature_name", "New Feature")
    description = data.get("description", "")
    benefits = data.get("benefits", [])

    html_content = build_feature_update_html(
        feature_name=feature_name,
        description=description,
        benefits=benefits
    )

    return jsonify({"html_content": html_content}), 200


@notification_bp.route("/preview-announcement", methods=["POST"])
@jwt_required()
@admin_required
def preview_announcement():
    """
    Preview the HTML content of an announcement email without sending it.
    """
    data = request.get_json()
    title = data.get("title", "Announcement")
    body = data.get("body", "")
    cta_text = data.get("cta_text")
    cta_link = data.get("cta_link")

    html_content = build_announcement_html(
        title=title,
        body=body,
        cta_text=cta_text,
        cta_link=cta_link
    )

    return jsonify({"html_content": html_content}), 200
