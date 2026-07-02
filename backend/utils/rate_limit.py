from pymongo import ReturnDocument
from bson import ObjectId
from db.mongo_client import db, users_collection
def check_usage_limit(user_id):
    """
    Checks user's cumulative usage against their tier's lifetime limit without incrementing.
    Returns: True if within limit, False if limit exceeded.
    """
    try:
        user_obj_id = ObjectId(user_id)

        # 1. Determine the user's tier and lifetime limit
        user = users_collection.find_one({"_id": user_obj_id}, {"is_pro_member": 1})
        is_premium = user.get('is_pro_member', False) if user else False

        # Define the default limits based on your plan
        default_limit = 6 if is_premium else 3

        # 2. Get the usage record without incrementing
        usage_record = db.user_limits.find_one({"user_id": user_obj_id})

        # Check for custom limit set by admin
        custom_limit = usage_record.get('custom_limit') if usage_record else None
        lifetime_limit = custom_limit if custom_limit is not None else default_limit

        current_count = usage_record.get('usage_count', 0) if usage_record else 0

        print(f"DEBUG: Usage Check - User {user_id} ({'Premium' if is_premium else 'Standard'}) Count: {current_count}/{lifetime_limit} (Custom: {custom_limit})")

        # 3. Check the limit
        if current_count >= lifetime_limit:
            return False # Limit exceeded
        else:
            return True # Within limit

    except Exception as e:
        print(f"Ratelimit check failed: {e}")
        # Default to allowing access if the rate limit system fails
        return True

def increment_usage(user_id):
    """
    Increments the usage count for a user after a successful API call.
    """
    try:
        user_obj_id = ObjectId(user_id)
        db.user_limits.find_one_and_update(
            {"user_id": user_obj_id},
            {"$inc": {"usage_count": 1}},
            upsert=True,
            return_document=ReturnDocument.AFTER
        )
    except Exception as e:
        print(f"Failed to increment usage: {e}")

# Backward compatibility - this will now check first, and increment should be called separately
def check_and_increment_usage(user_id):
    """
    DEPRECATED: Use check_usage_limit() and increment_usage() separately.
    This function now only checks the limit without incrementing.
    """
    return check_usage_limit(user_id)