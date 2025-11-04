from flask import Flask
from config import Config
from extensions.mongo import mongo
from extensions.jwt import jwt
from routes.auth import auth_bp


from pymongo import MongoClient
import os

uri = os.getenv("MongoURI", "mongodb://localhost:27017")
client = MongoClient(uri, serverSelectionTimeoutMS=5000)
try:
    print(client.server_info())  # prints server information if connected
    db = client.get_database()   # gets default DB from URI if present
    print("Collections:", db.list_collection_names())
except Exception as e:
    print("Connection failed:", repr(e))

    
def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    mongo.init_app(app)
    jwt.init_app(app)

    app.register_blueprint(auth_bp, url_prefix="/auth")

    @app.route("/")
    def home():
        return {"message": "Flask API Running 🚀"}

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
