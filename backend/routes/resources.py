from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId, errors
from db.mongo_client import db

resources_bp = Blueprint("resources", __name__)

def convert_objectids(obj):
    """Recursively convert ObjectIds to strings in a dict or list."""
    if isinstance(obj, dict):
        return {k: convert_objectids(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_objectids(item) for item in obj]
    elif isinstance(obj, ObjectId):
        return str(obj)
    else:
        return obj

@resources_bp.route("/", methods=["GET"])
@jwt_required()
def get_resources():
    """Get all resources for the authenticated user."""
    try:
        current_user_id = get_jwt_identity()
    except Exception as e:
        return jsonify({"message": "Authentication failed"}), 401

    try:
        user_obj_id = ObjectId(current_user_id)
    except errors.InvalidId:
        return jsonify({"message": "Invalid user ID"}), 400

    try:
        resources = list(db.resources.find({"user_id": user_obj_id}).sort("created_at", -1))
        # Convert all ObjectIds to strings for JSON serialization
        resources = convert_objectids(resources)
    except Exception as e:
        return jsonify({"message": "Database error"}), 500

    return jsonify({
        "message": "Resources retrieved successfully",
        "resources": resources
    }), 200
