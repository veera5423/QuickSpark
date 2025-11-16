import os
from dotenv import load_dotenv

load_dotenv()  # Load from .env file

class Config:
    GEMINI_API_KEY = "AIzaSyDo-o-hnu95OBE4hXcAPdZn9DpJqbg1aeA"
    SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey")
    MONGO_URI = "mongodb+srv://vipparlaveeranjaneyulu:Veera143@cluster0.suz63ji.mongodb.net/?appName=Cluster0"
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "jwt-secret")

    SENDGRID_API_KEY= os.getenv("SENDGRID_API_KEY")
    SENDGRID_SENDER= os.getenv("SENDGRID_SENDER")

    GOOGLE_REDIRECT_URI=os.getenv("GOOGLE_REDIRECT_URI")
    GOOGLE_CLIENT_ID=os.getenv("GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET=os.getenv("GOOGLE_CLIENT_SECRET")



