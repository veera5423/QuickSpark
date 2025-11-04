from pymongo import MongoClient
from config import Config

client = MongoClient(Config.MONGO_URI)
db = client["QuickSpark"]  # MongoDB auto-creates this when used

try:
    db.command("ping")
    print("✅ MongoDB connected successfully")
except Exception as e:
    print("❌ MongoDB connection failed:", e)
