import os

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey")
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/study_platform")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "jwt-secret")
    JWT_ACCESS_TOKEN_EXPIRES = 3600  # 1 hour