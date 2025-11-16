from flask_mail import Message
from config import Config

def send_email(to, subject, html):
    from app import mail
    print("DEBUG SMTP Username:", Config.MAIL_USERNAME)
    print("DEBUG SMTP Password:", Config.MAIL_PASSWORD)
    print("DEBUG Sender:", Config.MAIL_DEFAULT_SENDER)
    msg = Message(
        subject,
        recipients=[to],
        html=html
    )
    mail.send(msg)
