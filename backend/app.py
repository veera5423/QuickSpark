from flask import Flask
from flask_cors import CORS
from config import Config
from extensions.jwt import jwt
from routes.auth import auth_bp
from routes.ai_summarizer import ai_summarizer_bp
from routes.ai_quiz_generator import ai_quiz_bp
from routes.resources import resources_bp
from routes.career_explorer import career_explorer_bp
from routes.public_resources import public_resources_bp
from routes.admin import admin_bp
from flask_mail import Mail

mail = Mail()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    jwt.init_app(app)
    mail.init_app(app)

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(ai_summarizer_bp, url_prefix="/api/summarizer")
    app.register_blueprint(ai_quiz_bp, url_prefix="/api/quiz")
    app.register_blueprint(resources_bp, url_prefix="/api/resources")
    app.register_blueprint(career_explorer_bp, url_prefix='/api/career')
    app.register_blueprint(public_resources_bp, url_prefix='/api/public')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')

    
    CORS(
        app,
        origins=["http://localhost:5173", Config.FRONTEND],
        supports_credentials=True,
        allow_headers="*",
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    )

    @app.route("/")
    def home():
        return {"message": "Flask API Running 🚀"}

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=False, host="0.0.0.0", port=5000)
