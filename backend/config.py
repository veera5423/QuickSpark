import os
from dotenv import load_dotenv

load_dotenv()  # Load from .env file

class Config:
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey")
    MONGO_URI = os.getenv("MONGO_URI")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "jwt-secret")

    # SENDGRID_API_KEY= os.getenv("SENDGRID_API_KEY")
    # SENDGRID_SENDER= os.getenv("SENDGRID_SENDER")
    EMAIL_HOST = os.getenv("EMAIL_USER")
    EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")

    GOOGLE_REDIRECT_URI=os.getenv("GOOGLE_REDIRECT_URI")
    GOOGLE_CLIENT_ID=os.getenv("GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET=os.getenv("GOOGLE_CLIENT_SECRET")

    # Supabase settings
    SUPABASE_URL= os.getenv("SUPABASE_URL")
    SUPABASE_KEY= os.getenv("SUPABASE_KEY")
    SUPABASE_BUCKET= os.getenv("SUPABASE_BUCKET")
    SUPABASE_DB_URL= os.getenv("SUPABASE_DB_URL")
    FRONTEND= os.getenv("FRONTEND_URL")

