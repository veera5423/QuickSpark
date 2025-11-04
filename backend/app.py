from flask import Flask
from config import Config
from extensions.jwt import jwt
from routes.auth import auth_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    jwt.init_app(app)

    app.register_blueprint(auth_bp, url_prefix="/auth")

    @app.route("/")
    def home():
        return {"message": "Flask API Running 🚀"}

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
