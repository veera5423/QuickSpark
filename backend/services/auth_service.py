

from config import Config
import requests

from models.user import UserModel
from flask_jwt_extended import create_access_token, decode_token
from datetime import timedelta
from utils.sendgrid_helper import send_email_sendgrid
from werkzeug.security import generate_password_hash


class AuthService:

    @staticmethod
    def google_oauth(code):

        # Exchange authorization code for access token
        token_url = "https://oauth2.googleapis.com/token"
        token_data = {
            "code": code,
            "client_id": Config.GOOGLE_CLIENT_ID,
            "client_secret": Config.GOOGLE_CLIENT_SECRET,
            "redirect_uri": Config.GOOGLE_REDIRECT_URI,
            "grant_type": "authorization_code",
        }

        token_response = requests.post(token_url, data=token_data).json()
        access_token = token_response.get("access_token")

        if not access_token:
            return {"message": "Google token exchange failed"}, 400

        # Get user info
        user_info = requests.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token}"}
        ).json()

        email = user_info["email"]
        name = user_info.get("name", "Google User")

        # Check if user already exists
        user = UserModel.find_by_email(email)

        if not user:
            new_user = {
                "email": email,
                "username": name,
                "password": None,
                "is_verified": True,
                "auth_provider": "google"
            }
            user_id = UserModel.create_user(**new_user)
        else:
            user_id = user["_id"]

        # Create JWT token
        jwt_token = create_access_token(identity=str(user_id))

        return {
            "message": "Login successful",
            "token": jwt_token,
            "user": {
                "email": email,
                "username": name,
                "id": str(user_id),
            }
        }, 200



    @staticmethod
    def register(username, email, password, gender):
        if UserModel.find_by_email(email):
            return {"message": "Email already exists"}, 400

        user=UserModel.create_user(username, email, password, gender)
        print(f"User created with ID: {user['_id']}")
        token = create_access_token(identity=str(user["_id"]), expires_delta=timedelta(days=1))
        verify_link = f"https://quick-spark.vercel.app/verify-email/{token}"

        html = f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Your Email - QuickSpark</title>
            <style>
                body {{
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    margin: 0;
                    padding: 0;
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }}
                .container {{
                    max-width: 600px;
                    background: white;
                    border-radius: 20px;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                    overflow: hidden;
                    margin: 20px;
                }}
                .header {{
                    background: linear-gradient(135deg, #4CAF50, #45a049);
                    color: white;
                    padding: 40px 30px;
                    text-align: center;
                }}
                .header h1 {{
                    margin: 0;
                    font-size: 28px;
                    font-weight: 600;
                }}
                .content {{
                    padding: 40px 30px;
                    text-align: center;
                }}
                .content h2 {{
                    color: #333;
                    font-size: 24px;
                    margin-bottom: 20px;
                    font-weight: 500;
                }}
                .content p {{
                    color: #666;
                    font-size: 16px;
                    line-height: 1.6;
                    margin-bottom: 30px;
                }}
                .verify-btn {{
                    display: inline-block;
                    background: linear-gradient(135deg, #4CAF50, #45a049);
                    color: white;
                    text-decoration: none;
                    padding: 15px 40px;
                    border-radius: 50px;
                    font-weight: 600;
                    font-size: 16px;
                    box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
                    transition: all 0.3s ease;
                }}
                .verify-btn:hover {{
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
                }}
                .footer {{
                    background: #f8f9fa;
                    padding: 30px;
                    text-align: center;
                    color: #666;
                    font-size: 14px;
                }}
                .footer p {{
                    margin: 5px 0;
                }}
                .spark-icon {{
                    font-size: 48px;
                    margin-bottom: 10px;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="spark-icon">⚡</div>
                    <h1>QuickSpark</h1>
                </div>
                <div class="content">
                    <h2>Welcome aboard! 🚀</h2>
                    <p>Thank you for joining QuickSpark! To get started and unlock all the amazing features, please verify your email address.</p>
                    <a href="{verify_link}" class="verify-btn">Verify My Email</a>
                    <p style="margin-top: 30px; font-size: 14px; color: #999;">
                        If the button doesn't work, copy and paste this link into your browser:<br>
                        <a href="{verify_link}" style="color: #4CAF50; word-break: break-all;">{verify_link}</a>
                    </p>
                </div>
                <div class="footer">
                    <p><strong>QuickSpark Team</strong></p>
                    <p>Empowering your career journey with AI-driven insights</p>
                    <p style="font-size: 12px; margin-top: 15px;">
                        If you didn't create an account with QuickSpark, please ignore this email.
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
        



        send_email_sendgrid(email, "Verify Your Email", html)     

        # welcome email

        html = f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to QuickSpark</title>
            <style>
                body {{
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    margin: 0;
                    padding: 0;
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }}
                .container {{
                    max-width: 600px;
                    background: white;
                    border-radius: 20px;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                    overflow: hidden;
                    margin: 20px;
                }}
                .header {{
                    background: linear-gradient(135deg, #FF6B6B, #4ECDC4);
                    color: white;
                    padding: 40px 30px;
                    text-align: center;
                }}
                .header h1 {{
                    margin: 0;
                    font-size: 28px;
                    font-weight: 600;
                }}
                .content {{
                    padding: 40px 30px;
                }}
                .welcome-message {{
                    text-align: center;
                    margin-bottom: 30px;
                }}
                .welcome-message h2 {{
                    color: #333;
                    font-size: 24px;
                    margin-bottom: 10px;
                    font-weight: 500;
                }}
                .welcome-message .greeting {{
                    font-size: 18px;
                    color: #FF6B6B;
                    font-weight: 600;
                    margin-bottom: 20px;
                }}
                .content p {{
                    color: #666;
                    font-size: 16px;
                    line-height: 1.6;
                    margin-bottom: 20px;
                }}
                .features {{
                    background: #f8f9fa;
                    border-radius: 15px;
                    padding: 25px;
                    margin: 25px 0;
                }}
                .features h3 {{
                    color: #333;
                    font-size: 18px;
                    margin-bottom: 15px;
                    text-align: center;
                }}
                .feature-list {{
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 15px;
                    margin-top: 20px;
                }}
                .feature-item {{
                    display: flex;
                    align-items: center;
                    padding: 10px;
                    background: white;
                    border-radius: 10px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }}
                .feature-icon {{
                    font-size: 20px;
                    margin-right: 10px;
                    color: #4ECDC4;
                }}
                .feature-text {{
                    font-size: 14px;
                    color: #333;
                    font-weight: 500;
                }}
                .cta-button {{
                    display: inline-block;
                    background: linear-gradient(135deg, #FF6B6B, #4ECDC4);
                    color: white;
                    text-decoration: none;
                    padding: 15px 30px;
                    border-radius: 50px;
                    font-weight: 600;
                    font-size: 16px;
                    margin: 20px 0;
                    box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
                }}
                .footer {{
                    background: #f8f9fa;
                    padding: 30px;
                    text-align: center;
                    color: #666;
                    font-size: 14px;
                }}
                .footer p {{
                    margin: 5px 0;
                }}
                .spark-icon {{
                    font-size: 48px;
                    margin-bottom: 10px;
                }}
                @media (max-width: 480px) {{
                    .feature-list {{
                        grid-template-columns: 1fr;
                    }}
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="spark-icon">⚡</div>
                    <h1>QuickSpark</h1>
                </div>
                <div class="content">
                    <div class="welcome-message">
                        <h2>Welcome to the Future of Career Development! 🎉</h2>
                        <div class="greeting">Hello {username}!</div>
                    </div>
                    <p>Thank you for choosing QuickSpark! We're thrilled to have you join our innovative community where AI meets career growth.</p>
                    
                    <div class="features">
                        <h3>🚀 What awaits you:</h3>
                        <div class="feature-list">
                            <div class="feature-item">
                                <span class="feature-icon">🧠</span>
                                <span class="feature-text">AI-Powered Quiz Generation</span>
                            </div>
                            <div class="feature-item">
                                <span class="feature-icon">📄</span>
                                <span class="feature-text">Smart Resume Analysis</span>
                            </div>
                            <div class="feature-item">
                                <span class="feature-icon">💼</span>
                                <span class="feature-text">Career Path Exploration</span>
                            </div>
                            <div class="feature-item">
                                <span class="feature-icon">📚</span>
                                <span class="feature-text">Curated Learning Resources</span>
                            </div>
                        </div>
                    </div>
                    
                    <p>Your account has been created successfully. Please check your email (including spam folder) for the verification link to activate your account and start your journey.</p>
                    
                    <center>
                        <a href="https://quick-spark.vercel.app/dashboard" class="cta-button">Explore QuickSpark</a>
                    </center>
                    
                    <p>If you have any questions or need assistance, our support team is here to help!</p>
                </div>
                <div class="footer">
                    <p><strong>Best regards,</strong></p>
                    <p><strong>The QuickSpark Team</strong></p>
                    <p>Empowering careers with cutting-edge AI technology</p>
                    <p style="font-size: 12px; margin-top: 15px;">
                        Need help? Contact us at <a href="mailto:quickspark.1help@gmail.com" style="color: #FF6B6B;">quickspark.1help@gmail.com</a>
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
           
        send_email_sendgrid(email, "Welcome to QuickSpark!", html)

        return {"message": "Registered successfully. Check your email or spam to verify your account."}, 200
        

    @staticmethod
    def login(email, password):
        user = UserModel.find_by_email(email)
        if not user or not UserModel.verify_password(user, password):
            return {"message": "Invalid credentials"}, 401
        if not user.get("is_verified"):
            return {"message": "Email not verified. Please check your email."}, 403

        token = create_access_token(identity=str(user["_id"]), expires_delta=timedelta(hours=2))
        return {"access_token": token, "username": user["username"]}, 200
    
    @staticmethod
    def verify(token):
        user_id = decode_token(token)["sub"]
        if not user_id:
            return {"message": "Invalid or expired token"}, 400

        user = UserModel.find_by_id(user_id)
        if not user:
            return {"message": "User not found"}, 404

        if user.get("is_verified"):
            return {"message": "User already verified"}, 200

        UserModel.update_verification_status(user_id, True)
        return {"message": "Email verified successfully"}, 200
    
    @staticmethod
    def forgot_password(email):
        user = UserModel.find_by_email(email)
        if not user:
            return {"message": "User not found"}, 404

        token = create_access_token(identity=str(user["_id"]), expires_delta=timedelta(hours=1))
        reset_link = f"https://quick-spark.vercel.app/reset-password/{token}"

        html = f"""     
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Your Password - QuickSpark</title>
            <style>
                body {{
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    margin: 0;
                    padding: 0;
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }}
                .container {{
                    max-width: 600px;
                    background: white;
                    border-radius: 20px;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                    overflow: hidden;
                    margin: 20px;
                }}
                .header {{
                    background: linear-gradient(135deg, #FF9800, #FF5722);
                    color: white;
                    padding: 40px 30px;
                    text-align: center;
                }}
                .header h1 {{
                    margin: 0;
                    font-size: 28px;
                    font-weight: 600;
                }}
                .content {{
                    padding: 40px 30px;
                    text-align: center;
                }}
                .content h2 {{
                    color: #333;
                    font-size: 24px;
                    margin-bottom: 20px;
                    font-weight: 500;
                }}
                .content p {{
                    color: #666;
                    font-size: 16px;
                    line-height: 1.6;
                    margin-bottom: 30px;
                }}
                .reset-btn {{
                    display: inline-block;
                    background: linear-gradient(135deg, #FF9800, #FF5722);
                    color: white;
                    text-decoration: none;
                    padding: 15px 40px;
                    border-radius: 50px;
                    font-weight: 600;
                    font-size: 16px;
                    box-shadow: 0 4px 15px rgba(255, 152, 0, 0.3);
                    transition: all 0.3s ease;
                    margin-bottom: 20px;
                }}
                .reset-btn:hover {{
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(255, 152, 0, 0.4);
                }}
                .warning-box {{
                    background: #fff3cd;
                    border: 1px solid #ffeaa7;
                    border-radius: 10px;
                    padding: 20px;
                    margin: 20px 0;
                    text-align: left;
                }}
                .warning-box .icon {{
                    color: #856404;
                    font-size: 20px;
                    margin-right: 10px;
                }}
                .warning-box p {{
                    color: #856404;
                    margin: 0;
                    font-size: 14px;
                }}
                .footer {{
                    background: #f8f9fa;
                    padding: 30px;
                    text-align: center;
                    color: #666;
                    font-size: 14px;
                }}
                .footer p {{
                    margin: 5px 0;
                }}
                .spark-icon {{
                    font-size: 48px;
                    margin-bottom: 10px;
                }}
                .security-tips {{
                    background: #e8f5e8;
                    border-radius: 10px;
                    padding: 20px;
                    margin-top: 20px;
                }}
                .security-tips h4 {{
                    color: #2e7d32;
                    margin-bottom: 10px;
                    font-size: 16px;
                }}
                .security-tips ul {{
                    text-align: left;
                    color: #2e7d32;
                    font-size: 14px;
                    margin: 0;
                    padding-left: 20px;
                }}
                .security-tips li {{
                    margin-bottom: 5px;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="spark-icon">🔐</div>
                    <h1>QuickSpark</h1>
                </div>
                <div class="content">
                    <h2>Password Reset Request</h2>
                    <p>We received a request to reset your password for your QuickSpark account. No worries, we've got you covered!</p>
                    
                    <a href="{reset_link}" class="reset-btn">Reset My Password</a>
                    
                    <div class="warning-box">
                        <span class="icon">⚠️</span>
                        <p><strong>Important:</strong> This link will expire in 1 hour for security reasons. If you didn't request this password reset, please ignore this email - your password will remain unchanged.</p>
                    </div>
                    
                    <p style="margin-top: 30px; font-size: 14px; color: #999;">
                        If the button doesn't work, copy and paste this link into your browser:<br>
                        <a href="{reset_link}" style="color: #FF9800; word-break: break-all;">{reset_link}</a>
                    </p>
                    
                    <div class="security-tips">
                        <h4>🔒 Security Tips:</h4>
                        <ul>
                            <li>Choose a strong, unique password</li>
                            <li>Never share your password with anyone</li>
                            <li>Enable two-factor authentication when available</li>
                        </ul>
                    </div>
                </div>
                <div class="footer">
                    <p><strong>QuickSpark Security Team</strong></p>
                    <p>Your account security is our top priority</p>
                    <p style="font-size: 12px; margin-top: 15px;">
                        Didn't request this? <a href="mailto:quickspark.1help@gmail.com" style="color: #FF9800;">Contact our security team</a>
                    </p>
                </div>
            </div>
        </body>
        </html>
        """

        send_email_sendgrid(email, "Reset Your Password", html)
        return {"message": "Password reset link sent to your email"}, 200
    
    @staticmethod
    def verify_reset_token(token):
        try:
            user_id = decode_token(token)["sub"]
            if not user_id:
                return {"message": "Invalid or expired token"}, 400
            user = UserModel.find_by_id(user_id)
            if not user:
                return {"message": "User not found"}, 404
            return {"message": "Token valid"}, 200
        except Exception as e:
            return {"message": "Invalid or expired token"}, 400

    @staticmethod
    def reset_password_with_token(token, new_password):
        user_id = decode_token(token)["sub"]
        if not user_id:
            return {"message": "Invalid or expired token"}, 400
        user = UserModel.find_by_id(user_id)
        if not user:
            return {"message": "User not found"}, 404

        result = UserModel.update_password(user_id, new_password)
        if not result:
            return {"message": "Failed to update password"}, 500
        return {"message": "Password updated successfully"}, 200
#--------------
    @staticmethod
    def google_login_with_token(token):
        import google.auth.transport.requests
        from google.oauth2 import id_token

        try:
            # Verify the token
            idinfo = id_token.verify_oauth2_token(token, google.auth.transport.requests.Request(), Config.GOOGLE_CLIENT_ID)

            email = idinfo['email']
            name = idinfo.get('name', 'Google User')

            # Check if user already exists
            user = UserModel.find_by_email(email)

            if not user:
                user_id = UserModel.create_user(name, email, None, "google", True)
            else:
                user_id = user["_id"]

            # Create JWT token
            jwt_token = create_access_token(identity=str(user_id))

            return {
                "access_token": jwt_token,
                "username": name
            }, 200

        except ValueError:
            return {"message": "Invalid token"}, 400
