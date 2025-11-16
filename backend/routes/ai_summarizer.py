from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from datetime import datetime
from PyPDF2 import PdfReader
from io import BytesIO
import requests
import json
from werkzeug.utils import secure_filename
from google import genai

from config import Config
from db.mongo_client import db

ai_summarizer_bp = Blueprint("ai_summarizer", __name__)

# Initialize client with API key
client = genai.Client(api_key=Config.GEMINI_API_KEY)

def chunk_text(text, chunk_size=8000):
    """Split text into chunks of specified size."""
    return [text[i:i + chunk_size] for i in range(0, len(text), chunk_size)]

def summarize_chunk(chunk):
    """Summarize a single chunk using Gemini."""
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=f"Summarize this academic content clearly and concisely:\n\n{chunk}"
    )
    return response.text

@ai_summarizer_bp.route("/upload-and-summarize", methods=["POST"])
@jwt_required()
def upload_and_summarize():
    """
    Upload a PDF, extract text, summarize using Gemini, and store metadata + summary in MongoDB.
    """
    print("Endpoint reached: /upload-and-summarize")  # Debug log
    try:
        current_user_id = get_jwt_identity()
        print(f"JWT Identity: {current_user_id}")  # Debug log
    except Exception as e:
        print(f"Authentication error: {str(e)}")  # Debug log
        return jsonify({"message": f"Authentication error: {str(e)}"}), 401

    # 1️⃣ Check if file is present
    if "file" not in request.files:
        print("No file part in request")  # Debug log
        return jsonify({"message": "No file part"}), 400

    file = request.files["file"]
    print(f"File received: {file.filename}, size: {file.content_length if file.content_length else 'unknown'}")  # Debug log
    if file.filename == "":
        print("No selected file")  # Debug log
        return jsonify({"message": "No selected file"}), 400

    # 2️⃣ Validate file type
    if not file.filename.lower().endswith(".pdf"):
        print("Invalid file type")  # Debug log
        return jsonify({"message": "Only PDF files are supported."}), 400

    # Secure the filename
    filename = secure_filename(file.filename)
    print(f"Secure filename: {filename}")  # Debug log

    # 3️⃣ Extract text from PDF
    try:
        file_bytes = file.read()
        print(f"File bytes length: {len(file_bytes)}")  # Debug log
        pdf_reader = PdfReader(BytesIO(file_bytes))
        extracted_text = " ".join([page.extract_text() or "" for page in pdf_reader.pages])
        print(f"Extracted text length: {len(extracted_text)}")  # Debug log
    except Exception as e:
        print(f"PDF extraction error: {str(e)}")  # Debug log
        return jsonify({"message": "Error extracting text from PDF"}), 400

    if not extracted_text.strip():
        print("No readable text found")  # Debug log
        return jsonify({"message": "No readable text found in the PDF."}), 400

    # 4️⃣ Summarize using Gemini API (single call for efficiency)
    if not client:
        print("Gemini client not initialized")  # Debug log
        return jsonify({"message": "Gemini API key not configured"}), 500

    try:
        # Truncate text if too long to avoid multiple API calls
        max_text_length = 15000  # Adjust based on Gemini limits
        if len(extracted_text) > max_text_length:
            extracted_text = extracted_text[:max_text_length] + "..."

        print(f"Text length for summarization: {len(extracted_text)}")  # Debug log
        summary = summarize_chunk(extracted_text)
        print("Summary generated successfully")  # Debug log
    except Exception as e:
        print(f"Gemini API error: {str(e)}")  # Debug log
        return jsonify({"message": f"Gemini API error: {str(e)}"}), 500

    # 5️⃣ Save in MongoDB
    try:
        resource_doc = {
            "user_id": ObjectId(current_user_id),
            "filename": filename,
            "file_url": None,
            "summary": summary,
            "tags": [],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "status": "summarized",
            "linked_modules": {},
            "metadata": {
                "file_size_kb": len(file_bytes) / 1024,
                "page_count": len(pdf_reader.pages)
            }
        }
        result = db.resources.insert_one(resource_doc)
        print(f"Resource saved with ID: {result.inserted_id}")  # Debug log
    except Exception as e:
        print(f"DB insert error: {str(e)}")  # Debug log
        return jsonify({"message": "Database error saving resource"}), 500

    return jsonify({
        "message": "File summarized successfully ✅",
        "resource_id": str(result.inserted_id),
        "summary": summary
    }), 200
