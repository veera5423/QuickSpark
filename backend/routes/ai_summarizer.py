# from flask import Blueprint, request, jsonify
# from flask_jwt_extended import jwt_required, get_jwt_identity
# from bson import ObjectId
# from datetime import datetime
# from PyPDF2 import PdfReader
# from io import BytesIO
# import requests
# import json
# from werkzeug.utils import secure_filename
# from google import genai

# from config import Config
# from db.mongo_client import db

# ai_summarizer_bp = Blueprint("ai_summarizer", __name__)

# # Initialize client with API key
# client = genai.Client(api_key=Config.GEMINI_API_KEY)

# def chunk_text(text, chunk_size=8000):
#     """Split text into chunks of specified size."""
#     return [text[i:i + chunk_size] for i in range(0, len(text), chunk_size)]

# def summarize_chunk(chunk):
#     """Summarize a single chunk using Gemini."""
#     response = client.models.generate_content(
#         model="gemini-2.5-flash",
#         contents=f"Summarize this academic content clearly and concisely:\n\n{chunk}"
#     )
#     return response.text

# @ai_summarizer_bp.route("/upload-and-summarize", methods=["POST"])
# @jwt_required()
# def upload_and_summarize():
#     """
#     Upload a PDF, extract text, summarize using Gemini, and store metadata + summary in MongoDB.
#     """
#     print("Endpoint reached: /upload-and-summarize")  # Debug log
#     try:
#         current_user_id = get_jwt_identity()
#         print(f"JWT Identity: {current_user_id}")  # Debug log
#     except Exception as e:
#         print(f"Authentication error: {str(e)}")  # Debug log
#         return jsonify({"message": f"Authentication error: {str(e)}"}), 401

#     # 1️⃣ Check if file is present
#     if "file" not in request.files:
#         print("No file part in request")  # Debug log
#         return jsonify({"message": "No file part"}), 400

#     file = request.files["file"]
#     print(f"File received: {file.filename}, size: {file.content_length if file.content_length else 'unknown'}")  # Debug log
#     if file.filename == "":
#         print("No selected file")  # Debug log
#         return jsonify({"message": "No selected file"}), 400

#     # 2️⃣ Validate file type
#     if not file.filename.lower().endswith(".pdf"):
#         print("Invalid file type")  # Debug log
#         return jsonify({"message": "Only PDF files are supported."}), 400

#     # Secure the filename
#     filename = secure_filename(file.filename)
#     print(f"Secure filename: {filename}")  # Debug log

#     # 3️⃣ Extract text from PDF
#     try:
#         file_bytes = file.read()
#         print(f"File bytes length: {len(file_bytes)}")  # Debug log
#         pdf_reader = PdfReader(BytesIO(file_bytes))
#         extracted_text = " ".join([page.extract_text() or "" for page in pdf_reader.pages])
#         print(f"Extracted text length: {len(extracted_text)}")  # Debug log
#     except Exception as e:
#         print(f"PDF extraction error: {str(e)}")  # Debug log
#         return jsonify({"message": "Error extracting text from PDF"}), 400

#     if not extracted_text.strip():
#         print("No readable text found")  # Debug log
#         return jsonify({"message": "No readable text found in the PDF."}), 400

#     # 4️⃣ Summarize using Gemini API (single call for efficiency)
#     if not client:
#         print("Gemini client not initialized")  # Debug log
#         return jsonify({"message": "Gemini API key not configured"}), 500

#     try:
#         # Truncate text if too long to avoid multiple API calls
#         max_text_length = 15000  # Adjust based on Gemini limits
#         if len(extracted_text) > max_text_length:
#             extracted_text = extracted_text[:max_text_length] + "..."

#         print(f"Text length for summarization: {len(extracted_text)}")  # Debug log
#         summary = summarize_chunk(extracted_text)
#         print("Summary generated successfully")  # Debug log
#     except Exception as e:
#         print(f"Gemini API error: {str(e)}")  # Debug log
#         return jsonify({"message": f"Gemini API error: {str(e)}"}), 500

#     # 5️⃣ Save in MongoDB
#     try:
#         resource_doc = {
#             "user_id": ObjectId(current_user_id),
#             "filename": filename,
#             "file_url": None,
#             "summary": summary,
#             "tags": [],
#             "created_at": datetime.utcnow(),
#             "updated_at": datetime.utcnow(),
#             "status": "summarized",
#             "linked_modules": {},
#             "metadata": {
#                 "file_size_kb": len(file_bytes) / 1024,
#                 "page_count": len(pdf_reader.pages)
#             }
#         }
#         result = db.resources.insert_one(resource_doc)
#         print(f"Resource saved with ID: {result.inserted_id}")  # Debug log
#     except Exception as e:
#         print(f"DB insert error: {str(e)}")  # Debug log
#         return jsonify({"message": "Database error saving resource"}), 500

#     return jsonify({
#         "message": "File summarized successfully ✅",
#         "resource_id": str(result.inserted_id),
#         "summary": summary
#     }), 200


from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from datetime import datetime
from PyPDF2 import PdfReader
from io import BytesIO
from werkzeug.utils import secure_filename
import google.generativeai as genai
import json
import uuid
import psycopg2.extras
from langchain_text_splitters import RecursiveCharacterTextSplitter

from db.mongo_client import supabase, resources_collection, Config, pg_conn, db

ai_summarizer_bp = Blueprint("ai_summarizer", __name__)


try:
    # Configure the API key ONCE for the whole library
    genai.configure(api_key=Config.GEMINI_API_KEY)
    
    # Model for Summarization
    summarizer_model = genai.GenerativeModel("gemini-2.5-flash")
    print("✅ Summarizer model initialized ('gemini-2.5-flash').")


except Exception as e:
    print(f"❌ Error initializing GenerativeModel: {e}")
    summarizer_model = None
    

# --- (The rest of your file is below) ---

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=100
)

def get_summary_from_gemini(chunk):
    """Summarize a single chunk using the new GenerativeModel."""
    if not summarizer_model:
        raise Exception("Summarizer model not initialized")
    
    response = summarizer_model.generate_content(
        f"Summarize this academic content clearly and concisely:\n\n{chunk}"
    )
    return response.text

def create_and_store_embeddings(text_chunks, resource_uuid, user_id):
    if not pg_conn:
        print("Postgres connection not initialized. Skipping embedding.")
        return False

    try:
        print(f"Creating {len(text_chunks)} embeddings...")
        batch_response = genai.embed_content(
            model="models/text-embedding-004",
            content=text_chunks,
            task_type="RETRIEVAL_DOCUMENT",
            title="User Uploaded Document"
        )
        embeddings = batch_response['embedding']
        
        data_to_insert = []
        for i, chunk in enumerate(text_chunks):
            data_to_insert.append((
                resource_uuid,
                str(user_id),
                chunk,
                embeddings[i]
            ))

        with pg_conn.cursor() as cursor:
            psycopg2.extras.execute_values(
                cursor,
                """
                INSERT INTO doc_chunks (resource_id, user_id, content, embedding)
                VALUES %s
                """,
                data_to_insert
            )
            pg_conn.commit()
        
        print(f"Successfully inserted {len(text_chunks)} chunks into vector DB.")
        return True
    
    except Exception as e:
        print(f"Error during embedding or storing: {str(e)}")
        pg_conn.rollback()
        return False


@ai_summarizer_bp.route("/upload-and-summarize", methods=["POST"])
@jwt_required()
def upload_and_summarize():
    """
    Upload, save, summarize, AND create vector embeddings.
    """
    print("Endpoint reached: /upload-and-summarize")
    
    # Check if AI models are ready
    if not summarizer_model:
        return jsonify({"message": "AI models are not initialized. Check API key."}), 500
        
    try:
        current_user_id = get_jwt_identity()
        print(f"JWT Identity: {current_user_id}")
    except Exception as e:
        return jsonify({"message": f"Authentication error: {str(e)}"}), 401

    if "file" not in request.files:
        return jsonify({"message": "No file part"}), 400

    file = request.files["file"]
    
    if file.filename == "":
        return jsonify({"message": "No selected file"}), 400

    if not file.filename.lower().endswith(".pdf"):
        return jsonify({"message": "Only PDF files are supported."}), 400

    filename = secure_filename(file.filename)
    print(f"Secure filename: {filename}")

    try:
        file_bytes = file.read()
        file_size = len(file_bytes)
        file.seek(0)
    except Exception as e:
        return jsonify({"message": "Error reading file"}), 500

    resource_uuid = str(uuid.uuid4())

    # 1. Upload to Supabase Storage
    try:
        storage_path = f"{current_user_id}/{resource_uuid}.pdf"
        print(f"Uploading to Supabase at: {storage_path}")
        
        supabase.storage.from_(Config.SUPABASE_BUCKET).upload(
            path=storage_path,
            file=file_bytes,
            file_options={"content-type": file.content_type}
        )
        public_url = supabase.storage.from_(Config.SUPABASE_BUCKET).get_public_url(storage_path)
    except Exception as e:
        return jsonify({"message": f"File storage error: {str(e)}"}), 500

    # 2. Save initial metadata to MongoDB
    mongo_id = None
    try:
        pdf_reader_for_pages = PdfReader(BytesIO(file_bytes))
        page_count = len(pdf_reader_for_pages.pages)

        resource_doc = {
            "resource_uuid": resource_uuid,
            "user_id": ObjectId(current_user_id),
            "original_filename": filename,
            "storage_path": storage_path,
            "public_url": public_url,
            "summary": None,
            "tags": [],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "status": "processing",
            "metadata": {
                "file_size_kb": file_size / 1024,
                "page_count": page_count
            }
        }
        result = resources_collection.insert_one(resource_doc)
        mongo_id = result.inserted_id # Get the internal Mongo ID
        print(f"Resource metadata saved to MongoDB with _id: {mongo_id}")

    except Exception as e:
        print(f"DB insert error: {str(e)}")
        supabase.storage.from_(Config.SUPABASE_BUCKET).remove([storage_path])
        return jsonify({"message": "Database error saving resource"}), 500

    # 3. Extract text from PDF
    try:
        pdf_reader = PdfReader(BytesIO(file_bytes))
        extracted_text = " ".join([page.extract_text() or "" for page in pdf_reader.pages])
        print(f"Extracted text length: {len(extracted_text)}")
    except Exception as e:
        resources_collection.update_one(
            {"_id": mongo_id}, {"$set": {"status": "extraction_failed"}}
        )
        return jsonify({"message": "Error extracting text from PDF"}), 400

    if not extracted_text.strip():
        resources_collection.update_one(
            {"_id": mongo_id}, {"$set": {"status": "no_text_found"}}
        )
        return jsonify({"message": "No readable text found in the PDF."}), 400

    # 4. Chunk text and create embeddings
    try:
        print("Starting chunking and embedding process...")
        text_chunks = text_splitter.split_text(extracted_text)
        
        create_and_store_embeddings(
            text_chunks,
            resource_uuid,
            current_user_id
        )
        resources_collection.update_one(
            {"_id": mongo_id}, {"$set": {"status": "embedded"}}
        )
    except Exception as e:
         print(f"Embedding process failed: {str(e)}")
         resources_collection.update_one(
            {"_id": mongo_id}, {"$set": {"status": "embedding_failed"}}
        )

    # 5. Summarize using Gemini API
    try:
        max_text_length = 15000
        summary_text_input = extracted_text
        if len(summary_text_input) > max_text_length:
            summary_text_input = summary_text_input[:max_text_length] + "..."

        print(f"Text length for summarization: {len(summary_text_input)}")
        
       
        summary = get_summary_from_gemini(summary_text_input) 
        
        print("Summary generated successfully")
    except Exception as e:
        resources_collection.update_one(
            {"_id": mongo_id}, {"$set": {"status": "summarization_failed"}}
        )
        return jsonify({"message": f"Gemini API error: {str(e)}"}), 500

    # 6. Update the MongoDB record with the summary
    try:
        resources_collection.update_one(
            {"_id": mongo_id},
            {"$set": {
                "summary": summary,
                "status": "summarized", # Final status
                "updated_at": datetime.utcnow()
            }}
        )
        print(f"Resource {mongo_id} updated with summary.")
    except Exception as e:
        print(f"DB update error: {str(e)}")
        pass 

    # 7. Return Success
    return jsonify({
        "message": "File uploaded, summarized, and indexed successfully ✅",
        "resource_id": resource_uuid,
        "summary": summary
    }), 200




#------To chat with a specific resource------#
@ai_summarizer_bp.route("/chat-with-resource", methods=["POST"])
@jwt_required()
def chat_with_resource():
    """
    Handles a chat question for a specific resource.
    1. Gets the user's question and resource_id.
    2. Embeds the question.
    3. Searches Postgres for relevant chunks using the 'match_chunks' function.
    4. Feeds the chunks + question to Gemini.
    5. Returns the AI-generated answer.
    """
    print("Endpoint reached: /chat-with-resource")
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        question = data.get("question")
        resource_uuid = data.get("resource_id") # The UUID we saved

        if not question or not resource_uuid:
            return jsonify({"message": "Missing 'question' or 'resource_id'"}), 400

        print(f"User: {current_user_id}, Resource: {resource_uuid}, Question: {question}")

        # 1. Embed the user's question
        print("Embedding user question...")
        question_embedding = genai.embed_content(
            model="models/text-embedding-004",
            content=question,
            task_type="RETRIEVAL_QUERY", # ❗️ Note: 'RETRIEVAL_QUERY' type
        )['embedding']

        # 2. Search Postgres for relevant chunks
        print("Searching for relevant chunks...")
        context_chunks = []
        with pg_conn.cursor() as cursor:
            # We call the 'match_chunks' function we created in the database
            cursor.callproc(
                'match_chunks', 
                (
                    question_embedding, # query_embedding
                    0.5,                # match_threshold (how similar)
                    5,                  # match_count (how many chunks)
                    current_user_id,    # p_user_id
                    resource_uuid       # p_resource_id
                )
            )
            # Fetch all results from the function call
            for row in cursor.fetchall():
                context_chunks.append(row[1]) # row[1] is the 'content' column

        if not context_chunks:
            print("No relevant context found.")
            return jsonify({"answer": "I'm sorry, I couldn't find any relevant information in that document to answer your question."}), 200

        print(f"Found {len(context_chunks)} relevant chunks.")

        # 3. Build the prompt for Gemini
        context_str = "\n\n".join(context_chunks)
        prompt = f"""
        You are a helpful study assistant. Answer the user's question based *only* on the context provided below.
        If the answer is not in the context, say "I'm sorry, I couldn't find that information in the document."

        CONTEXT:
        ---
        {context_str}
        ---

        QUESTION:
        {question}

        ANSWER:
        """

        # 4. Feed to Gemini and get the answer
        print("Generating final answer...")
        if not summarizer_model: # We can reuse the summarizer model for chat
            return jsonify({"message": "Chat model not initialized"}), 500
            
        response = summarizer_model.generate_content(
            prompt,
            request_options={"timeout": 180}
            )
        
        print("Answer generated successfully.")
        return jsonify({"answer": response.text}), 200

    except Exception as e:
        print(f"❌ Error in chat endpoint: {str(e)}")
        # Rollback any potential transaction
        if pg_conn:
            pg_conn.rollback()
        return jsonify({"message": f"An internal error occurred: {str(e)}"}), 500