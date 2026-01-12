from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import google.generativeai as genai
from config import Config
import json

voice_interview_bp = Blueprint('voice_interview', __name__)

try:
    # Configure the API key ONCE for the whole library
    genai.configure(api_key=Config.GEMINI_API_KEY)
    
    # Model for Summarization
    model = genai.GenerativeModel("gemini-2.5-flash")
    print("✅  interview model initialized ('gemini-2.5-flash').")


except Exception as e:
    print(f"❌ Error initializing GenerativeModel: {e}")
    model = None

@voice_interview_bp.route('/generate_questions', methods=['POST'])
@jwt_required()
def generate_questions():
    data = request.get_json()
    job_title = data.get('job_title')
    field = data.get('field')
    job_description = data.get('job_description')
    time_minutes = data.get('time_minutes', 5)

    # Calculate number of questions based on time (approx 1-2 min per question)
    num_questions = min(5, max(3, time_minutes // 2))

    prompt = f"""Generate {num_questions} interview questions for a {job_title} position in {field}.
Job Description: {job_description}
Questions should be behavioral and technical, suitable for a voice interview.

Format: Number each question as:
1. Question text here
2. Question text here
etc."""

    try:
        if model is None:
            # Fallback questions if no API key
            fallback_questions = [
                "Can you tell me about yourself and your background?",
                "What interests you about this position?",
                "Describe a challenging project you've worked on.",
                "Where do you see yourself in 5 years?"
            ]
            return jsonify({"questions": fallback_questions[:num_questions]})
            
        response = model.generate_content(prompt)
        text = response.text.strip()
        
        # Parse questions from numbered list
        questions = []
        lines = text.split('\n')
        for line in lines:
            line = line.strip()
            if line and any(line.startswith(f'{i}.') for i in range(1, num_questions + 1)):
                # Extract question text after the number and dot
                parts = line.split('.', 1)
                if len(parts) > 1:
                    question = parts[1].strip()
                    if question:
                        questions.append(question)
        
        # If parsing failed, provide fallback questions
        if not questions:
            questions = [
                f"Tell me about your experience with {field} projects.",
                f"What challenges have you faced in {job_title} roles?",
                f"How do you approach problem-solving in {field}?",
                f"What are your strengths in {job_title} positions?"
            ][:num_questions]
        
        return jsonify({"questions": questions[:num_questions]})
    except Exception as e:
        # Fallback questions if API fails
        fallback_questions = [
            "Can you tell me about yourself and your background?",
            "What interests you about this position?",
            "Describe a challenging project you've worked on.",
            "Where do you see yourself in 5 years?"
        ]
        return jsonify({"questions": fallback_questions[:num_questions]})

@voice_interview_bp.route('/evaluate_all_answers', methods=['POST'])
@jwt_required()
def evaluate_all_answers():
    data = request.get_json()
    answers = data.get('answers', [])

    if not answers:
        return jsonify({
            "overall_score": 5,
            "strengths": "No answers provided",
            "weaknesses": "Unable to evaluate without answers",
            "improvements": "Please complete the interview"
        })

    # Prepare the prompt with all Q&A
    qa_text = "\n".join([f"Q: {item['question']}\nA: {item['answer']}" for item in answers])
    
    prompt = f"""Evaluate this complete interview performance based on all the questions and answers:

{qa_text}

Provide overall feedback in this exact format:
Overall Score: [average score 0-10]
Overall Strengths: [brief description of main strengths across answers]
Overall Weaknesses: [brief description of main weaknesses across answers]
Overall Improvements: [brief suggestions for improvement]"""

    try:
        if model is None:
            # Fallback feedback
            return jsonify({
                "overall_score": 7,
                "strengths": "Clear and structured answers",
                "weaknesses": "Could provide more specific examples",
                "improvements": "Consider adding metrics and outcomes"
            })
            
        response = model.generate_content(prompt)
        text = response.text.strip()
        
        # Parse the structured response
        feedback = {
            "overall_score": 5,
            "strengths": "Answers provided",
            "weaknesses": "Unable to fully evaluate",
            "improvements": "Consider adding more details"
        }
        
        lines = text.split('\n')
        for line in lines:
            line = line.strip()
            if line.lower().startswith('overall score:'):
                try:
                    score = float(line.split(':', 1)[1].strip())
                    feedback["overall_score"] = max(0, min(10, score))
                except:
                    pass
            elif line.lower().startswith('overall strengths:'):
                feedback["strengths"] = line.split(':', 1)[1].strip()
            elif line.lower().startswith('overall weaknesses:'):
                feedback["weaknesses"] = line.split(':', 1)[1].strip()
            elif line.lower().startswith('overall improvements:'):
                feedback["improvements"] = line.split(':', 1)[1].strip()
        
        return jsonify(feedback)
    except Exception as e:
        return jsonify({
            "overall_score": 5,
            "strengths": "Interview completed",
            "weaknesses": "Unable to evaluate due to technical issue",
            "improvements": "Try again"
        })