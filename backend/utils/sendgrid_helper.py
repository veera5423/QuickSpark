import os
import requests
from config import Config

SENDGRID_API = "https://api.sendgrid.com/v3/mail/send"
API_KEY = Config.SENDGRID_API_KEY
SENDER = Config.SENDGRID_SENDER

def send_email_sendgrid(to_email: str, subject: str, html_content: str):
    payload = {
        "personalizations": [
            {"to": [{"email": to_email}], "subject": subject}
        ],
        "from": {"email": SENDER},
        "content": [
            {"type": "text/html", "value": html_content}
        ]
    }

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }

    response = requests.post(SENDGRID_API, json=payload, headers=headers)
    response.raise_for_status()
    # SendGrid API returns 202 Accepted with empty body on success
    return {"message": "Email sent successfully"}
