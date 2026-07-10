from google import genai
from google.genai.errors import APIError
from config import Config
from db.mongo_client import db
from datetime import datetime
from bson import ObjectId

# Initialize client with API key
client = genai.Client(api_key=Config.GEMINI_API_KEY)

class GeminiQuotaExceededError(Exception):
    """Custom exception for Gemini API quota exceeded errors."""
    pass

def log_api_usage(user_id, model, endpoint, tokens_used=None, success=True, error_message=None):
    """Log API usage for monitoring purposes."""
    try:
        usage_doc = {
            "user_id": ObjectId(user_id) if user_id else None,
            "model": model,
            "endpoint": endpoint,
            "tokens_used": tokens_used,
            "success": success,
            "error_message": error_message,
            "timestamp": datetime.utcnow()
        }
        db.api_usage.insert_one(usage_doc)
    except Exception as e:
        print(f"Failed to log API usage: {e}")

def summarize_with_gemini(prompt: str, user_id=None, endpoint="quiz_generation") -> str:
    """
    Generate content using Gemini API for quiz generation.
    Raises GeminiQuotaExceededError for quota exceeded errors.
    Logs all API usage for monitoring.
    """
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",  #lite model for cost efficiency
            contents=prompt
        )

        # Log successful usage
        usage_metadata = getattr(response, 'usage_metadata', None)
        tokens_used = getattr(usage_metadata, 'total_token_count', None) if usage_metadata else None
        log_api_usage(
            user_id=user_id,
            model="gemini-2.5-flash",
            endpoint=endpoint,
            tokens_used=tokens_used,
            success=True
        )

        return response.text
    except APIError as e:
        # Log failed usage
        log_api_usage(
            user_id=user_id,
            model="gemini-2.5-flash",
            endpoint=endpoint,
            success=False,
            error_message=str(e)
        )

        if e.code == 429 and "RESOURCE_EXHAUSTED" in str(e):
            raise GeminiQuotaExceededError("Gemini API quota exceeded. Please try again later or upgrade your plan.")
        else:
            # Re-raise other API errors
            raise e
    except Exception as e:
        # Log unexpected errors
        log_api_usage(
            user_id=user_id,
            model="gemini-2.5-flash",
            endpoint=endpoint,
            success=False,
            error_message=str(e)
        )
        # Re-raise any other unexpected errors
        raise e
