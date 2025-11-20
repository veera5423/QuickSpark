from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from db.mongo_client import db # Import your main MongoDB 'db' object

# Create the new blueprint
career_explorer_bp = Blueprint("career_explorer", __name__)

# Assumes you have these collections in your 'db'
skills_collection = db["skills"]
roles_collection = db["career_roles"]

# -----------------------------------------------------------------
# 1. ADMIN ENDPOINTS (For adding data)


@career_explorer_bp.route("/skills", methods=["POST"])
@jwt_required() # You can later add an admin check here
def create_skill():
    """
    Admin endpoint to create a new skill.
    """
    try:
        data = request.get_json()
        if not data.get("skill_name") or not data.get("category"):
            return jsonify({"message": "Missing 'skill_name' or 'category'"}), 400

        new_skill = {
            "skill_name": data["skill_name"],
            "category": data["category"]
        }
        
        result = skills_collection.insert_one(new_skill)
        
        return jsonify({
            "message": "Skill created successfully",
            "skill_id": str(result.inserted_id)
        }), 201

    except Exception as e:
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500

@career_explorer_bp.route("/career-roles", methods=["POST"])
@jwt_required() # You can later add an admin check here
def create_career_role():
    """
    Admin endpoint to create a new career role.
    """
    try:
        data = request.get_json()
        if not data.get("role_name") or not data.get("skill_ids"):
            return jsonify({"message": "Missing 'role_name' or 'skill_ids'"}), 400

        new_role = {
            "role_name": data["role_name"],
            "description": data.get("description", ""),
            "avg_salary": data.get("avg_salary", ""),
            "skill_ids": data["skill_ids"] # Expects a list of strings
        }
        
        result = roles_collection.insert_one(new_role)
        
        return jsonify({
            "message": "Career role created successfully",
            "role_id": str(result.inserted_id)
        }), 201

    except Exception as e:
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500
    

# 2. USER ENDPOINTS (For fetching data)
# -----------------------------------------------------------------


@career_explorer_bp.route("/career-roles", methods=["GET"])
@jwt_required()
def get_all_career_roles():
    """
    Fetches all available career roles for the main explorer page.
    """
    try:
        roles = list(roles_collection.find({}, {
            "skill_ids": 0 # Exclude the skill_ids list for a clean response
        }))
        
        # Convert ObjectId to string for JSON serialization
        for role in roles:
            role["_id"] = str(role["_id"])
            
        return jsonify(roles), 200

    except Exception as e:
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500

@career_explorer_bp.route("/career-roles/<role_id>", methods=["GET"])
@jwt_required()
def get_career_role_details(role_id):
    """
    Fetches the full details for a single career role,
    including all its associated skills.
    """
    try:
        # 1. Find the career role
        role = roles_collection.find_one({"_id": ObjectId(role_id)})
        if not role:
            return jsonify({"message": "Role not found"}), 404

        # 2. Get the list of skill IDs
        skill_ids = role.get("skill_ids", [])
        
        # 3. Find all skills that match those IDs
        # Convert string IDs to ObjectIds
        skill_object_ids = [ObjectId(sid) for sid in skill_ids]
        
        skills = list(skills_collection.find({
            "_id": {"$in": skill_object_ids}
        }))

        # 4. Prepare the response
        # Convert ObjectIds to strings
        role["_id"] = str(role["_id"])
        for skill in skills:
            skill["_id"] = str(skill["_id"])
            
        # Add the full skill objects to the role
        role["skills"] = skills
        del role["skill_ids"] # Clean up the response

        return jsonify(role), 200

    except Exception as e:
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500

@career_explorer_bp.route("/skills", methods=["GET"])
@jwt_required()
def get_skills():
    """Fetch all skills."""
    try:
        current_user_id = get_jwt_identity()
        user_obj_id = ObjectId(current_user_id)
    except Exception as e:
        return jsonify({"message": "Authentication failed"}), 401

    try:
        skills = list(skills_collection.find({}))
        # Convert ObjectIds to strings for JSON serialization
        for skill in skills:
            skill["_id"] = str(skill["_id"])
    except Exception as e:
        return jsonify({"message": "Database error"}), 500

    return jsonify({
        "message": "Skills retrieved successfully",
        "skills": skills
    }), 200

@career_explorer_bp.route("/skills/<skill_id>", methods=["GET"])
@jwt_required()
def get_skill_details(skill_id):
    """Fetch details for a single skill by ID."""
    try:
        current_user_id = get_jwt_identity()
        user_obj_id = ObjectId(current_user_id)
        skill_obj_id = ObjectId(skill_id)
    except Exception as e:
        return jsonify({"message": "Authentication failed or invalid skill ID"}), 401

    try:
        skill = skills_collection.find_one({"_id": skill_obj_id})
        if not skill:
            return jsonify({"message": "Skill not found"}), 404

        # Convert ObjectId to string
        skill["_id"] = str(skill["_id"])
    except Exception as e:
        return jsonify({"message": "Database error"}), 500

    return jsonify({
        "message": "Skill details retrieved successfully",
        "skill": skill
    }), 200
