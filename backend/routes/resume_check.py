from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from PyPDF2 import PdfReader
from io import BytesIO
import json
from utils.gemini_helper import summarize_with_gemini, GeminiQuotaExceededError

from utils.rate_limit import check_usage_limit, increment_usage
from db.mongo_client import Config, users_collection
from datetime import datetime

resume_check_bp = Blueprint("resume_check", __name__)

# Uses `summarize_with_gemini` helper from `utils/gemini_helper.py`


@resume_check_bp.route("/resume-check", methods=["POST"])
@jwt_required()
def resume_check():
    """
    Upload a resume PDF and optional job description, then return an AI evaluation score and feedback.
    Returns JSON: { result: { score: int, strengths: [...], improvements: [...], feedback: str } }
    """
    try:
        current_user_id = get_jwt_identity()
        if not check_usage_limit(current_user_id):
            return jsonify({"message": "AI usage limit exceeded."}), 429
    except Exception as e:
        print(f"Auth/usage error: {e}")
        return jsonify({"message": f"Authentication or rate-limit error: {str(e)}"}), 401

    # Ensure only Pro/Premium users can access this feature
    try:
        from bson import ObjectId
        user_doc = users_collection.find_one({"_id": ObjectId(current_user_id)}, {"is_pro_member": 1, "has_used_trial": 1})
        is_pro = user_doc.get("is_pro_member", False) if user_doc else False
        has_used_trial = user_doc.get("has_used_trial", False) if user_doc else False

        # Allow a single one-time trial use for non-pro users
        if not is_pro:
            if not has_used_trial:
                # Mark trial used and allow this request to proceed
                try:
                    users_collection.update_one(
                        {"_id": ObjectId(current_user_id)},
                        {"$set": {"has_used_trial": True, "trial_used_at": datetime.utcnow()}}
                    )
                except Exception as e:
                    print(f"Failed to mark trial usage: {e}")
            else:
                return jsonify({"message": "Resume check is available for Pro/Premium users only."}), 403
    except Exception as e:
        print(f"Subscription check failed: {e}")
        return jsonify({"message": "Unable to verify subscription status."}), 500

    if "file" not in request.files:
        return jsonify({"message": "No file part"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"message": "No selected file"}), 400
    if not file.filename.lower().endswith('.pdf'):
        return jsonify({"message": "Only PDF files are supported."}), 400

    job_description = request.form.get('job_description', '')

    try:
        file_bytes = file.read()
        pdf_reader = PdfReader(BytesIO(file_bytes))
        resume_text = "\n".join([p.extract_text() or "" for p in pdf_reader.pages])
    except Exception as e:
        print(f"PDF extraction failed: {e}")
        return jsonify({"message": f"Error extracting PDF text: {str(e)}"}), 400

    if not resume_text.strip():
        return jsonify({"message": "No readable text found in the PDF."}), 400

    # We'll call the shared helper which is responsible for initializing the client.

    # Compose a JSON-only response prompt
    prompt = (
        "You are an expert career coach. Evaluate the resume text provided and return ONLY a JSON object with keys:\n"
        "  - score: an integer 0-100\n"
        "  - strengths: an array of short strings\n"
        "  - improvements: an array of short strings\n"
        "  - feedback: a short human-readable paragraph\n"
        "Do not include any explanation outside the JSON.\n\n"
        "Resume:\n" + resume_text[:20000] + "\n\n"
    )
    if job_description:
        prompt += "Job Description:\n" + job_description[:8000] + "\n\n"
    prompt += "When scoring, consider clarity, relevance to the job (if provided), formatting, and keywords. Keep arrays short (3-6 items)."

    try:
        # Use shared helper which returns the model text
        text = summarize_with_gemini(prompt, user_id=current_user_id, endpoint="resume_check")
        # Increment usage only on successful API call
        increment_usage(current_user_id)
        cleaned = text.strip()

        # Remove common fenced code blocks (```json ... ``` or ``` ... ```)
        if cleaned.startswith('```'):
            # remove leading fence and trailing fence
            parts = cleaned.split('```')
            # parts example: ['', 'json\n{...}\n', ''] or ['', '\n{...}\n', '']
            if len(parts) >= 2:
                cleaned = parts[1].strip()

        # Try direct JSON parse
        try:
            parsed = json.loads(cleaned)
            return jsonify({"result": parsed}), 200
        except Exception:
            # Attempt to extract a JSON object substring by matching braces
            def extract_json_substring(s: str):
                starts = [i for i, ch in enumerate(s) if ch == '{']
                for start in starts:
                    depth = 0
                    for i in range(start, len(s)):
                        if s[i] == '{':
                            depth += 1
                        elif s[i] == '}':
                            depth -= 1
                            if depth == 0:
                                candidate = s[start:i+1]
                                try:
                                    return json.loads(candidate)
                                except Exception:
                                    break
                return None

            parsed_inner = extract_json_substring(cleaned)
            if parsed_inner:
                return jsonify({"result": parsed_inner}), 200

            # Fallback: return structured JSON with feedback in `feedback` field
            fallback = {
                "score": None,
                "strengths": [],
                "improvements": [],
                "feedback": cleaned
            }
            return jsonify({"result": fallback}), 200
    except GeminiQuotaExceededError as e:
        print(f"Gemini API quota exceeded: {e}")
        return jsonify({"message": str(e)}), 429
    except Exception as e:
        print(f"AI evaluation error: {e}")
        return jsonify({"message": f"AI error: {str(e)}"}), 500
