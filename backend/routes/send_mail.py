from utils import sendgrid_helper
from flask import Blueprint, request, jsonify   

send_mail_bp = Blueprint("send_mail", __name__)

@send_mail_bp.route("/send-email", methods=["POST"])
def send_email():
    """
    Send an email using SendGrid.
    Expects JSON: { to_email: str, subject: str, html_content: str }
    Returns JSON: { message: str }
    """
    data = request.get_json()
    to_email = 'quickspark.1help@gmail.com'
    full_name = data.get("name")
    from_email=data.get("email")
    subject = data.get("subject")
    message = data.get("message")

    html_message = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Contact Message - QuickSpark</title>
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
                background: linear-gradient(135deg, #2196F3, #21CBF3);
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
            .message-header {{
                background: #f8f9fa;
                border-radius: 15px;
                padding: 20px;
                margin-bottom: 25px;
                border-left: 5px solid #2196F3;
            }}
            .sender-info {{
                display: flex;
                align-items: center;
                margin-bottom: 15px;
            }}
            .sender-icon {{
                font-size: 24px;
                margin-right: 10px;
                color: #2196F3;
            }}
            .sender-details h3 {{
                margin: 0;
                color: #333;
                font-size: 18px;
            }}
            .sender-details p {{
                margin: 5px 0 0 0;
                color: #666;
                font-size: 14px;
            }}
            .subject {{
                background: #e3f2fd;
                border-radius: 10px;
                padding: 15px;
                margin-bottom: 20px;
            }}
            .subject .label {{
                font-weight: 600;
                color: #1976D2;
                font-size: 14px;
                text-transform: uppercase;
                letter-spacing: 1px;
            }}
            .subject .value {{
                color: #333;
                font-size: 16px;
                margin-top: 5px;
            }}
            .message-content {{
                background: white;
                border: 2px solid #e0e0e0;
                border-radius: 15px;
                padding: 25px;
                margin-bottom: 25px;
                line-height: 1.6;
                color: #333;
                font-size: 16px;
                white-space: pre-wrap;
            }}
            .action-buttons {{
                text-align: center;
                margin-top: 30px;
            }}
            .reply-btn {{
                display: inline-block;
                background: linear-gradient(135deg, #2196F3, #21CBF3);
                color: white;
                text-decoration: none;
                padding: 12px 25px;
                border-radius: 50px;
                font-weight: 600;
                font-size: 14px;
                margin: 0 10px 10px 0;
                box-shadow: 0 4px 15px rgba(33, 150, 243, 0.3);
            }}
            .archive-btn {{
                display: inline-block;
                background: #f5f5f5;
                color: #666;
                text-decoration: none;
                padding: 12px 25px;
                border-radius: 50px;
                font-weight: 600;
                font-size: 14px;
                margin: 0 10px 10px 0;
                border: 2px solid #e0e0e0;
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
            .timestamp {{
                color: #999;
                font-size: 12px;
                text-align: right;
                margin-top: 10px;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="spark-icon">💬</div>
                <h1>QuickSpark</h1>
            </div>
            <div class="content">
                <div class="message-header">
                    <div class="sender-info">
                        <span class="sender-icon">👤</span>
                        <div class="sender-details">
                            <h3>New Contact Message</h3>
                            <p>From: {full_name} ({from_email})</p>
                        </div>
                    </div>
                </div>
                
                <div class="subject">
                    <div class="label">Subject</div>
                    <div class="value">{subject}</div>
                </div>
                
                <div class="message-content">
                    {message}
                </div>
                
                <div class="action-buttons">
                    <a href="mailto:{from_email}?subject=Re: {subject}" class="reply-btn">Reply to Sender</a>
                    <a href="#" class="archive-btn">Mark as Read</a>
                </div>
                
                <div class="timestamp">
                    Received on {__import__('datetime').datetime.now().strftime('%B %d, %Y at %I:%M %p')}
                </div>
            </div>
            <div class="footer">
                <p><strong>QuickSpark Support System</strong></p>
                <p>Automated message notification</p>
                <p style="font-size: 12px; margin-top: 15px;">
                    This message was sent to our support team for prompt attention.
                </p>
            </div>
        </div>
    </body>
    </html>
    """

    if not to_email or not subject or not message:
        return jsonify({"message": "Missing required fields."}), 400

    try:
        result = sendgrid_helper.send_email_sendgrid(to_email, subject, html_message)
        return jsonify(result), 200
    
    except Exception as e:
        print(f"Email sending failed: {e}")
        return jsonify({"message": f"Failed to send email: {str(e)}"}), 500

@send_mail_bp.route("/submit-feedback", methods=["POST"])
def submit_feedback():
    """
    Submit user feedback.
    Expects JSON: { rating: int, feedback: str, email: str, timestamp: str }
    Returns JSON: { message: str }
    """
    data = request.get_json()
    rating = data.get("rating")
    feedback_text = data.get("feedback", "")
    user_email = data.get("email", "")
    timestamp = data.get("timestamp", "")

    if not rating or rating < 1 or rating > 5:
        return jsonify({"message": "Valid rating (1-5) is required."}), 400

    # Send feedback email to admin
    to_email = 'quickspark.1help@gmail.com'
    subject = f"New User Feedback - Rating: {rating}/5"

    html_message = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New User Feedback - QuickSpark</title>
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
                background: linear-gradient(135deg, #2196F3, #21CBF3);
                color: white;
                padding: 40px 30px;
                text-align: center;
            }}
            .content {{
                padding: 40px 30px;
            }}
            .rating {{
                font-size: 24px;
                font-weight: bold;
                color: #ff9800;
                text-align: center;
                margin: 20px 0;
            }}
            .feedback {{
                background: #f8f9fa;
                border-left: 4px solid #2196F3;
                padding: 20px;
                margin: 20px 0;
                border-radius: 8px;
            }}
            .footer {{
                background: #f8f9fa;
                padding: 20px 30px;
                text-align: center;
                color: #666;
                font-size: 14px;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>⭐ New User Feedback</h1>
                <p>QuickSpark AI User Experience</p>
            </div>
            <div class="content">
                <div class="rating">
                    Rating: {'⭐' * rating}{'☆' * (5 - rating)} ({rating}/5)
                </div>
                
                {f'<div class="feedback"><strong>User Feedback:</strong><br>{feedback_text}</div>' if feedback_text else ''}
                
                {f'<p><strong>User Email:</strong> {user_email}</p>' if user_email else '<p><em>Anonymous feedback</em></p>'}
                
                <p><strong>Submitted:</strong> {timestamp}</p>
            </div>
            <div class="footer">
                <p>This feedback was submitted through the QuickSpark AI platform.</p>
                <p>Keep building amazing features! 🚀</p>
            </div>
        </div>
    </body>
    </html>
    """

    try:
        result = sendgrid_helper.send_email_sendgrid(to_email, subject, html_message)
        return jsonify({"message": "Thank you for your feedback!"}), 200
    
    except Exception as e:
        print(f"Feedback submission failed: {e}")
        return jsonify({"message": f"Failed to submit feedback: {str(e)}"}), 500