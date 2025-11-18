from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId, errors
from datetime import datetime
import json
import logging

from db.mongo_client import db
from utils.gemini_helper import summarize_with_gemini
from utils.quiz_prompt import quiz_generation_prompt

ai_quiz_bp = Blueprint("ai_quiz_generator", __name__)

# Set up logger
logger = logging.getLogger(__name__)

@ai_quiz_bp.route("/generate-quiz-text", methods=["POST"])
@jwt_required()
def generate_quiz_from_text():
    """Generate MCQs from provided text with difficulty levels."""
    try:
        current_user_id = get_jwt_identity()
    except Exception as e:
        logger.error(f"Authentication error: {e}")
        return jsonify({"message": "Authentication failed"}), 401

    # Validate user_id
    try:
        user_obj_id = ObjectId(current_user_id)
    except errors.InvalidId:
        return jsonify({"message": "Invalid user ID"}), 400

    # Get request data
    body = request.get_json(silent=True) or {}
    text = body.get("text", "").strip()
    if not text:
        return jsonify({"message": "Text content is required"}), 400

    # Get difficulty level and num_questions (default = medium, 5)
    level = body.get("level", "medium").lower()
    if level not in ["easy", "medium", "hard"]:
        return jsonify({"message": "Invalid difficulty level. Choose easy, medium, or hard."}), 400

    num_questions = body.get("num_questions", 10)
    if not isinstance(num_questions, int) or num_questions < 1 or num_questions > 20:
        return jsonify({"message": "num_questions must be an integer between 1 and 20"}), 400

    # 3️ Create quiz prompt
    prompt = quiz_generation_prompt(text, level=level, num_questions=num_questions)

    # 4️ Call Gemini API
    try:
        quiz_json_text = summarize_with_gemini(prompt)
        logger.info(f"Gemini API call successful for text-based quiz")
    except Exception as e:
        logger.error(f"Gemini API error: {e}")
        return jsonify({"message": f"Gemini API error: {e}"}), 500

    # 5️ Parse quiz data
    try:
        # Clean the response: remove markdown code blocks if present
        cleaned_text = quiz_json_text.strip()
        if cleaned_text.startswith("```json"):
            cleaned_text = cleaned_text[7:].strip()
        if cleaned_text.endswith("```"):
            cleaned_text = cleaned_text[:-3].strip()

        quiz_data = json.loads(cleaned_text)
        # Basic validation: ensure it's a list of dicts
        if not isinstance(quiz_data, list) or not all(isinstance(q, dict) for q in quiz_data):
            raise ValueError("Quiz data must be a list of question objects")
    except (json.JSONDecodeError, ValueError) as e:
        logger.error(f"JSON parsing error: {e}. Raw response: {quiz_json_text}")
        return jsonify({"message": f"Invalid JSON received from Gemini: {e}. Raw response: {quiz_json_text[:200]}..."}), 500

# 6️ Save quiz in DB (without linking to a resource)
    
    
    skill_id = body.get("skill_id") 
    
    quiz_doc = {
        "user_id": user_obj_id,
        "resource_id": None,
        "skill_id": ObjectId(skill_id) if skill_id else None, 
        "difficulty": level,
        "questions": quiz_data,
        "text_content": text[:1000],
        "created_at": datetime.utcnow(),
    }

    try:
        result = db.quizzes.insert_one(quiz_doc)
        logger.info(f"Text-based quiz saved with ID: {result.inserted_id}")
    except Exception as e:
        logger.error(f"Database error saving quiz: {e}")
        return jsonify({"message": "Database error saving quiz"}), 500

    return jsonify({
        "message": f"{level.capitalize()} quiz generated successfully ✅",
        "quiz_id": str(result.inserted_id),
        "difficulty": level,
        "questions": quiz_data
    }), 200

@ai_quiz_bp.route("/generate-quiz/<resource_id>", methods=["POST"])
@jwt_required()
def generate_quiz(resource_id):
    """Generate MCQs from summarized text of a resource with difficulty levels."""
    try:
        current_user_id = get_jwt_identity()
    except Exception as e:
        logger.error(f"Authentication error: {e}")
        return jsonify({"message": "Authentication failed"}), 401

    # Validate resource_id
    try:
        resource_obj_id = ObjectId(resource_id)
    except errors.InvalidId:
        return jsonify({"message": "Invalid resource ID"}), 400

    # Validate user_id
    try:
        user_obj_id = ObjectId(current_user_id)
    except errors.InvalidId:
        return jsonify({"message": "Invalid user ID"}), 400

    # 1️ Fetch resource
    try:
        resource = db.resources.find_one({"_id": resource_obj_id, "user_id": user_obj_id})
    except Exception as e:
        logger.error(f"Database error fetching resource: {e}")
        return jsonify({"message": "Database error"}), 500

    if not resource:
        return jsonify({"message": "Resource not found or unauthorized"}), 404

    summary = resource.get("summary", "")
    if not summary:
        return jsonify({"message": "No summary found for this resource"}), 400

    # 2️ Get difficulty level and num_questions (default = medium, 5)
    body = request.get_json(silent=True) or {}
    level = body.get("level", "medium").lower()
    if level not in ["easy", "medium", "hard"]:
        return jsonify({"message": "Invalid difficulty level. Choose easy, medium, or hard."}), 400

    num_questions = body.get("num_questions", 10)
    if not isinstance(num_questions, int) or num_questions < 1 or num_questions > 20:
        return jsonify({"message": "num_questions must be an integer between 1 and 20"}), 400

    # 3️ Create quiz prompt
    prompt = quiz_generation_prompt(summary, level=level, num_questions=num_questions)

    # 4️Call Gemini API
    try:
        quiz_json_text = summarize_with_gemini(prompt)
        logger.info(f"Gemini API call successful for resource {resource_id}")
    except Exception as e:
        logger.error(f"Gemini API error: {e}")
        return jsonify({"message": f"Gemini API error: {e}"}), 500

    # 5️ Parse quiz data
    try:
        # Clean the response: remove markdown code blocks if present
        cleaned_text = quiz_json_text.strip()
        if cleaned_text.startswith("```json"):
            cleaned_text = cleaned_text[7:].strip()
        if cleaned_text.endswith("```"):
            cleaned_text = cleaned_text[:-3].strip()

        quiz_data = json.loads(cleaned_text)
        # Basic validation: ensure it's a list of dicts
        if not isinstance(quiz_data, list) or not all(isinstance(q, dict) for q in quiz_data):
            raise ValueError("Quiz data must be a list of question objects")
    except (json.JSONDecodeError, ValueError) as e:
        logger.error(f"JSON parsing error: {e}. Raw response: {quiz_json_text}")
        return jsonify({"message": f"Invalid JSON received from Gemini: {e}. Raw response: {quiz_json_text[:200]}..."}), 500

    # 6️ Save quiz in DB
    quiz_doc = {
        "user_id": user_obj_id,
        "resource_id": resource_obj_id,
        "difficulty": level,
        "questions": quiz_data,
        "created_at": datetime.utcnow(),
    }

    try:
        result = db.quizzes.insert_one(quiz_doc)
        logger.info(f"Quiz saved with ID: {result.inserted_id}")
    except Exception as e:
        logger.error(f"Database error saving quiz: {e}")
        return jsonify({"message": "Database error saving quiz"}), 500

    # 7️ Link quiz to resource
    try:
        db.resources.update_one(
            {"_id": resource_obj_id},
            {"$set": {"linked_modules.mock_test_id": str(result.inserted_id)}}
        )
        logger.info(f"Resource {resource_id} linked to quiz {result.inserted_id}")
    except Exception as e:
        logger.error(f"Database error updating resource: {e}")
        # Note: Quiz is already saved, but linking failed. Consider rollback or alert.

    return jsonify({
        "message": f"{level.capitalize()} quiz generated successfully ✅",
        "quiz_id": str(result.inserted_id),
        "difficulty": level,
        "questions": quiz_data
    }), 200

@ai_quiz_bp.route("/submit-quiz/<quiz_id>", methods=["POST"])
@jwt_required()
def submit_quiz(quiz_id):
    """Submit answers, score, and update skill progress."""
    try:
        current_user_id = get_jwt_identity()
        user_obj_id = ObjectId(current_user_id)
        quiz_obj_id = ObjectId(quiz_id)
    except Exception as e:
        return jsonify({"message": "Authentication or ID error"}), 400

    body = request.get_json(silent=True) or {}
    answers = body.get("answers", [])

    # 1️ Fetch quiz
    quiz = db.quizzes.find_one({"_id": quiz_obj_id, "user_id": user_obj_id})
    if not quiz:
        return jsonify({"message": "Quiz not found"}), 404

    questions = quiz.get("questions", [])
    total_questions = len(questions)

    # 2️ Validate and score answers
    correct_count = 0
    feedback = []
    for i, q in enumerate(questions):
        if i >= len(answers):
            user_answer = ""
        else:
            user_answer = answers[i].strip().upper() if isinstance(answers[i], str) else ""
            
        correct_answer = q.get("answer", "").strip().upper()
        is_correct = user_answer == correct_answer
        if is_correct:
            correct_count += 1
        feedback.append({
            "question_index": i,
            "is_correct": is_correct,
            "explanation": q.get("explanation", "")
        })

    score = (correct_count / total_questions) * 100 if total_questions > 0 else 0

    # 3️ Save attempt
    attempt_doc = {
        "user_id": user_obj_id,
        "quiz_id": quiz_obj_id,
        "answers": answers,
        "score": score,
        "feedback": feedback,
        "total_questions": total_questions,
        "correct_count": correct_count,
        "incorrect_count": total_questions - correct_count,
        "passed": score >= 80,
        "submitted_at": datetime.utcnow(),
    }
    
    
    attempt_result = db.quiz_attempts.insert_one(attempt_doc)

    
    passing_score = 80
    skill_id_from_quiz = quiz.get("skill_id")
    
    print(f"DEBUG: Processing Score: {score}, Skill ID found: {skill_id_from_quiz}")

    if skill_id_from_quiz and score >= passing_score:
        print(f"DEBUG: User PASSED! Updating skill progress...")
        try:
            db.user_skill_progress.update_one(
                {
                    "user_id": user_obj_id,
                    "skill_id": skill_id_from_quiz
                },
                {
                    "$set": {
                        "status": "completed",
                        "completed_at": datetime.utcnow(),
                        
                        "last_quiz_attempt_id": attempt_result.inserted_id 
                    }
                },
                upsert=True
            )
            print("DEBUG: MongoDB update successful.")
        except Exception as e:
            # Use logger or print, but don't crash
            print(f"DEBUG: Failed to update skill progress: {e}")

    return jsonify({
        "message": "Quiz submitted successfully ✅",
        
        "attempt_id": str(attempt_result.inserted_id),
        "score": score,
        "passed": score >= passing_score,
        "feedback": feedback
    }), 200



@ai_quiz_bp.route("/get-attempts", methods=["GET"])
@jwt_required()
def get_user_attempts():
    """Get all quiz attempts for the authenticated user."""
    try:
        current_user_id = get_jwt_identity()
    except Exception as e:
        logger.error(f"Authentication error: {e}")
        return jsonify({"message": "Authentication failed"}), 401

    try:
        user_obj_id = ObjectId(current_user_id)
    except errors.InvalidId:
        return jsonify({"message": "Invalid user ID"}), 400

    try:
        attempts = list(db.quiz_attempts.find({"user_id": user_obj_id}).sort("submitted_at", -1))
        # Convert ObjectIds to strings for JSON serialization and add difficulty from quiz
        for attempt in attempts:
            attempt["_id"] = str(attempt["_id"])
            attempt["user_id"] = str(attempt["user_id"])
            attempt["quiz_id"] = str(attempt["quiz_id"])

            # Fetch difficulty from the associated quiz
            quiz = db.quizzes.find_one({"_id": ObjectId(attempt["quiz_id"])})
            if quiz:
                attempt["difficulty"] = quiz.get("difficulty", "unknown")
            else:
                attempt["difficulty"] = "unknown"
    except Exception as e:
        logger.error(f"Database error fetching attempts: {e}")
        return jsonify({"message": "Database error"}), 500

    return jsonify({
        "message": "Attempts retrieved successfully",
        "attempts": attempts
    }), 200

@ai_quiz_bp.route("/get-quizzes", methods=["GET"])
@jwt_required()
def get_user_quizzes():
    """Get all quizzes for the authenticated user."""
    try:
        current_user_id = get_jwt_identity()
    except Exception as e:
        logger.error(f"Authentication error: {e}")
        return jsonify({"message": "Authentication failed"}), 401

    try:
        user_obj_id = ObjectId(current_user_id)
    except errors.InvalidId:
        return jsonify({"message": "Invalid user ID"}), 400

    try:
        quizzes = list(db.quizzes.find({"user_id": user_obj_id}).sort("created_at", -1))
        # Convert ObjectIds to strings for JSON serialization
        for quiz in quizzes:
            quiz["_id"] = str(quiz["_id"])
            quiz["user_id"] = str(quiz["user_id"])
            quiz["resource_id"] = str(quiz["resource_id"]) if quiz["resource_id"] else None
            quiz["skill_id"] = str(quiz["skill_id"]) if quiz.get("skill_id") else None
    except Exception as e:
        logger.error(f"Database error fetching quizzes: {e}")
        return jsonify({"message": "Database error"}), 500

    return jsonify({
        "message": "Quizzes retrieved successfully",
        "quizzes": quizzes
    }), 200


@ai_quiz_bp.route("/completed-skills", methods=["GET"])
@jwt_required()
def get_completed_skills():
    """Fetch a list of skill IDs that the user has successfully completed."""
    try:
        current_user_id = get_jwt_identity()
        user_obj_id = ObjectId(current_user_id)
        
        # Find all completed skills for this user
        progress_docs = list(db.user_skill_progress.find(
            {"user_id": user_obj_id, "status": "completed"},
            {"skill_id": 1, "_id": 0} # Only return the skill_id field
        ))
        
        # Convert ObjectIds to strings so they can be sent as JSON
        completed_ids = [str(doc["skill_id"]) for doc in progress_docs if "skill_id" in doc]
        
        return jsonify({"completed_skill_ids": completed_ids}), 200
    except Exception as e:
        return jsonify({"message": f"Error fetching progress: {str(e)}"}), 500
    
    

@ai_quiz_bp.route("/get-attempt-details/<attempt_id>", methods=["GET"])
@jwt_required()
def get_attempt_details(attempt_id):
    """Get detailed information for a specific quiz attempt."""
    try:
        current_user_id = get_jwt_identity()
        user_obj_id = ObjectId(current_user_id)
        attempt_obj_id = ObjectId(attempt_id)
    except Exception as e:
        return jsonify({"message": "Authentication or ID error"}), 400

    try:
        # Fetch the attempt
        attempt = db.quiz_attempts.find_one({"_id": attempt_obj_id, "user_id": user_obj_id})
        if not attempt:
            return jsonify({"message": "Attempt not found"}), 404

        # Fetch the associated quiz
        quiz = db.quizzes.find_one({"_id": attempt["quiz_id"]})
        if not quiz:
            return jsonify({"message": "Quiz not found"}), 404

        # Prepare detailed response
        questions = quiz.get("questions", [])
        user_answers = attempt.get("answers", [])
        score = attempt.get("score", 0)

        # Build question details
        question_details = []
        for i, q in enumerate(questions):
            user_answer = user_answers[i] if i < len(user_answers) else ""
            correct_answer = q.get("answer", "").strip().upper()
            is_correct = user_answer.strip().upper() == correct_answer

            question_details.append({
                "question": q.get("question", ""),
                "options": q.get("options", []),
                "user_answer": user_answer,
                "correct_answer": correct_answer,
                "is_correct": is_correct,
                "explanation": q.get("explanation", "")
            })

        return jsonify({
            "message": "Attempt details retrieved successfully",
            "attempt": {
                "id": str(attempt["_id"]),
                "score": score,
                "submitted_at": attempt.get("submitted_at"),
                "difficulty": quiz.get("difficulty", "unknown"),
                "questions": question_details
            }
        }), 200
    except Exception as e:
        logger.error(f"Database error fetching attempt details: {e}")
        return jsonify({"message": "Database error"}), 500
