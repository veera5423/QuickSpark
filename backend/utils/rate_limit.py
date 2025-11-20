from pymongo import ReturnDocument
from bson import ObjectId
from db.mongo_client import db, users_collection
def check_and_increment_usage(user_id):
    """
    Checks user's cumulative usage against their tier's lifetime limit and increments the counter.
    Returns: True if within limit, False if limit exceeded.
    """
    try:
        user_obj_id = ObjectId(user_id)
        
        # 1. Determine the user's tier and lifetime limit
        user = users_collection.find_one({"_id": user_obj_id}, {"is_pro_member": 1})
        is_premium = user.get('is_pro_member', False) if user else False
        
        # Define the limits based on your plan
        lifetime_limit = 6 if is_premium else 3 
        
        # 2. Get/Update the usage record (Atomic Operation)
        # We use user_id as the primary key for the usage count
        usage_record = db.user_limits.find_one_and_update( # Using db.user_limits for simplicity
            {"user_id": user_obj_id},
            {"$inc": {"usage_count": 1}}, # Atomically increase count by 1
            upsert=True,
            return_document=ReturnDocument.AFTER
        )
        
        current_count = usage_record.get('usage_count', 0)
        
        print(f"DEBUG: Usage Check - User {user_id} ({'Premium' if is_premium else 'Standard'}) Count: {current_count}/{lifetime_limit}")
        
        # 3. Check the limit
        # If the new count (after incrementing) is greater than the limit, deny access.
        if current_count > lifetime_limit:
            return False # Limit exceeded
        else:
            return True # Within limit

    except Exception as e:
        print(f"Ratelimit check failed: {e}")
        # Default to allowing access if the rate limit system fails
        return True