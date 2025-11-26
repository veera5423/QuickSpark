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
    <h2>New Message from {full_name} ({from_email})</h2
    <p>{message}</p>
    """

    if not to_email or not subject or not message:
        return jsonify({"message": "Missing required fields."}), 400

    try:
        result = sendgrid_helper.send_email_sendgrid(to_email, subject, html_message)
        return jsonify(result), 200
    
    except Exception as e:
        print(f"Email sending failed: {e}")
        return jsonify({"message": f"Failed to send email: {str(e)}"}), 500