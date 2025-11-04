import os
from dotenv import load_dotenv

load_dotenv()  # Load from .env file

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey")
    MONGO_URI = "mongodb+srv://vipparlaveeranjaneyulu:Veera143@cluster0.suz63ji.mongodb.net/?appName=Cluster0"
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "jwt-secret")
