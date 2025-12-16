from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId, errors
from datetime import datetime
from functools import wraps

# Import necessary collections
# NOTE: Assuming you have 'db.users' and 'db.resources' available via import
from db.mongo_client import db, resources_collection, users_collection, links_collection 

admin_bp = Blueprint("admin", __name__)

# --- Helper Function: Admin Authorization Check ---
def admin_required(fn):
    """Decorator to check if the current user is marked as an Admin."""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            current_user_id = get_jwt_identity()
            user_obj_id = ObjectId(current_user_id)
            
            # Find user and check the 'is_admin' field
            admin_user = users_collection.find_one(
                {"_id": user_obj_id},
                {"is_admin": 1} # Only fetch the admin flag
            )

            # Check if user exists AND if 'is_admin' is True
            if not admin_user or not admin_user.get('is_admin', False):
                return jsonify({"message": "Authorization failed: Admin privileges required."}), 403 # 403 Forbidden
            
            return fn(*args, **kwargs)
        except errors.InvalidId:
            return jsonify({"message": "Invalid user identifier."}), 401
        except Exception as e:
            print(f"Admin check failed: {e}")
            return jsonify({"message": "Authentication error."}), 401
    return wrapper

# -----------------------------------------------------------------
# 1. 👥 USER MANAGEMENT (Section 3)
# -----------------------------------------------------------------

@admin_bp.route("/users", methods=["GET"])
@jwt_required()
@admin_required # 🚨 PROTECTED ROUTE
def list_all_users():
    """
    Lists all users with their current status (Admin, Premium).
    """
    try:
        users = list(users_collection.find({}, {"password": 0})) # Exclude password field
        
        # Serialize ObjectIds and dates
        for user in users:
            # 1. Safely convert Mongo ID to string
            user_id_str = str(user['_id'])
            user['_id'] = user_id_str 
            
            # 2. Get registration date: Try to use the created_at field first, 
            #    then fall back to the ObjectId's generation time.
            if user.get('created_at'):
                date_str = user['created_at'].isoformat()
            else:
                # Fallback: Create a new ObjectId just to get the generation time
                try:
                    date_str = ObjectId(user_id_str).generation_time.isoformat()
                except:
                    date_str = 'N/A' # Failsafe
            
            user['date_registered'] = date_str

            # 3. Ensure boolean flags exist for frontend display
            user['is_admin'] = user.get('is_admin', False)
            user['is_pro_member'] = user.get('is_pro_member', False)
            
        return jsonify({"users": users}), 200
    except Exception as e:
        return jsonify({"message": f"Error fetching users: {str(e)}"}), 500

@admin_bp.route("/users/<user_id>/toggle", methods=["POST"])
@jwt_required()
@admin_required # 🚨 PROTECTED ROUTE
def toggle_user_status(user_id):
    """
    Toggles is_admin or is_pro_member status for a user.
    """
    try:
        data = request.get_json()
        field = data.get("field") # 'is_admin' or 'is_pro_member'
        
        if field not in ['is_admin', 'is_pro_member']:
            return jsonify({"message": "Invalid field specified."}), 400
        
        user_obj_id = ObjectId(user_id)
        
        # 1. Get current status
        user = users_collection.find_one({"_id": user_obj_id}, {field: 1})
        if not user:
            return jsonify({"message": "User not found."}), 404
            
        current_status = user.get(field, False)
        new_status = not current_status
        
        # 2. Update status
        users_collection.update_one(
            {"_id": user_obj_id},
            {"$set": {field: new_status}}
        )
        
        return jsonify({
            "message": f"{field.replace('_', ' ').title()} status updated to {new_status}.",
            "new_status": new_status,
            "field": field
        }), 200
        
    except errors.InvalidId:
        return jsonify({"message": "Invalid user ID."}), 400
    except Exception as e:
        return jsonify({"message": f"Error updating user status: {str(e)}"}), 500

# -----------------------------------------------------------------
# 2. 📝 MASTER RESOURCE VIEW (Section 4b - Your requirement)
# -----------------------------------------------------------------

@admin_bp.route("/resources/all", methods=["GET"])
@jwt_required()
@admin_required # 🚨 PROTECTED ROUTE
def list_all_resources():
    """
    Lists ALL resources (private, public, pending, verified) for admin review.
    Includes full metadata, summaries, and verification status.
    """
    try:
        # Fetch all documents, excluding passwords or large embedded data if any
        resources = list(resources_collection.find({}))
        
        # We need a list of user IDs to fetch emails for contact
        user_ids = {r['user_id'] for r in resources}
        user_details = {u['_id']: u.get('email', 'N/A') for u in users_collection.find({"_id": {"$in": list(user_ids)}}, {"email": 1})}

        # Serialize and compile final list
        output = []
        for resource in resources:
            # Safely get the uploader's email
            uploader_email = user_details.get(resource.get('user_id'), 'Unknown User')

            resource_data = {
                "id": str(resource['_id']),
                "filename": resource.get('original_filename'),
                "type": resource.get('type'),
                "status": resource.get('verification_status', 'N/A'),
                "is_public": resource.get('is_public', False),
                "uploader_email": uploader_email,
                "summary": resource.get('summary', 'No summary generated.'),
                "created_at": resource.get('created_at').isoformat() if resource.get('created_at') else 'N/A',
                # URL to the source file for admin check
                "source_url": resource.get('public_url') or "N/A" 
            }
            output.append(resource_data)
            
        return jsonify({"resources": output}), 200
    except Exception as e:
        return jsonify({"message": f"Error fetching master resource list: {str(e)}"}), 500

# -----------------------------------------------------------------
# 3. 📋 DASHBOARD OVERVIEW (Section 1)
# -----------------------------------------------------------------

@admin_bp.route("/dashboard-stats", methods=["GET"])
@jwt_required()
@admin_required # 🚨 PROTECTED ROUTE
def get_admin_dashboard_stats():
    """
    Provides key statistics for the Admin dashboard overview.
    """
    try:
        total_users = users_collection.count_documents({})
        total_resources = resources_collection.count_documents({})
        pending_review = resources_collection.count_documents({"verification_status": "pending"})
        verified_resources = resources_collection.count_documents({"verification_status": "verified"})
        pro_members = users_collection.count_documents({"is_pro_member": True})
        total_reports = db.resource_interactions.count_documents({"action_type": "report"})
        pending_pro_requests = db.pro_requests.count_documents({"status": "pending"})
        
        # Calculate percentages and ratios
        verification_percentage = round((verified_resources / total_resources * 100) if total_resources > 0 else 0, 1)
        pro_percentage = round((pro_members / total_users * 100) if total_users > 0 else 0, 1)
        
        stats = {
            "total_users": total_users,
            "total_resources": total_resources,
            "pending_review": pending_review,
            "verified_resources": verified_resources,
            "pro_members": pro_members,
            "total_reports": total_reports,
            "pending_pro_requests": pending_pro_requests,
            "verification_percentage": verification_percentage,
            "pro_percentage": pro_percentage,
            "unverified_resources": total_resources - verified_resources
        }
        return jsonify(stats), 200
    except Exception as e:
        return jsonify({"message": f"Error fetching dashboard stats: {str(e)}"}), 500

# -----------------------------------------------------------------
# 4. 🗑️ DELETE RESOURCE
# -----------------------------------------------------------------

@admin_bp.route("/resources/<resource_id>", methods=["DELETE"], provide_automatic_options=False)
@jwt_required()
@admin_required # 🚨 PROTECTED ROUTE
def delete_resource(resource_id):
    """
    Delete a resource by ID.
    """
    try:
        try:
            resource_obj_id = ObjectId(resource_id)
        except errors.InvalidId:
            return jsonify({"message": "Invalid resource ID."}), 400

        resource = resources_collection.find_one({"_id": resource_obj_id})
        if not resource:
            return jsonify({"message": "Resource not found."}), 404

        # Delete the resource
        resources_collection.delete_one({"_id": resource_obj_id})
        
        # Optionally delete related interactions
        db.resource_interactions.delete_many({"resource_id": resource_id})

        return jsonify({"message": "Resource deleted successfully."}), 200
    except Exception as e:
        return jsonify({"message": f"Error deleting resource: {str(e)}"}), 500

# OPTIONS handler for DELETE (no auth required for preflight)
@admin_bp.route("/resources/<resource_id>", methods=["OPTIONS"])
def delete_resource_options(resource_id):
    return jsonify({}), 200

# -----------------------------------------------------------------
# 5. 📊 RESOURCE REPORTS
# -----------------------------------------------------------------

@admin_bp.route("/reports", methods=["GET"], provide_automatic_options=False)
@jwt_required()
@admin_required # 🚨 PROTECTED ROUTE
def get_resource_reports():
    """
    Fetch all resource reports.
    """
    try:
        reports = list(db.resource_interactions.find({"action_type": "report"}).sort("created_at", -1))
        
        # Hydrate with resource and user info
        resource_ids = {r.get("resource_id") for r in reports if r.get("resource_id")}
        user_ids = {r.get("user_id") for r in reports if r.get("user_id")}
        
        resources_map = {str(doc["_id"]): doc.get("original_filename", "Unknown") for doc in resources_collection.find({"_id": {"$in": [ObjectId(rid) if isinstance(rid, str) else rid for rid in resource_ids]}}, {"original_filename": 1})}
        users_map = {doc["_id"]: doc.get("email", "Unknown") for doc in users_collection.find({"_id": {"$in": list(user_ids)}}, {"email": 1})}
        
        output = []
        for report in reports:
            resource_name = resources_map.get(str(report.get("resource_id")), "Unknown")
            reporter_email = users_map.get(report.get("user_id"), "Unknown")
            
            output.append({
                "id": str(report["_id"]),
                "resource_id": str(report["resource_id"]),
                "resource_name": resource_name,
                "reporter_email": reporter_email,
                "reason": report.get("report_reason", "No reason provided"),
                "reported_at": report.get("created_at").isoformat() if report.get("created_at") else "N/A"
            })
        
        return jsonify({"reports": output}), 200
    except Exception as e:
        return jsonify({"message": f"Error fetching reports: {str(e)}"}), 500

# OPTIONS handler for GET reports (no auth required for preflight)
@admin_bp.route("/reports", methods=["OPTIONS"])
def get_reports_options():
    return jsonify({}), 200