from flask import Flask
from flask_cors import CORS
from config import Config
from extensions.jwt import jwt
from routes.auth import auth_bp
from routes.ai_summarizer import ai_summarizer_bp
from routes.ai_quiz_generator import ai_quiz_bp
from routes.resources import resources_bp
from routes.career_explorer import career_explorer_bp
from flask_mail import Mail


mail = Mail()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app, origins=["http://localhost:5173", "http://127.0.0.1:5173","https://ld83wj6c-5173.inc1.devtunnels.ms/"], supports_credentials=True, allow_headers=["*"])
    jwt.init_app(app)
    mail.init_app(app)

    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(ai_summarizer_bp, url_prefix="/api/summarizer")
    app.register_blueprint(ai_quiz_bp, url_prefix="/api/quiz")
    app.register_blueprint(resources_bp, url_prefix="/api/resources")
    app.register_blueprint(career_explorer_bp, url_prefix='/api/career')

    @app.route("/")
    def home():
        return {"message": "Flask API Running 🚀"}

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
