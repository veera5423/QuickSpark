# import os
# from sendgrid import SendGridAPIClient
# from sendgrid.helpers.mail import Mail
# from config import Config

# SENDGRID_API = "https://api.sendgrid.com/v3/mail/send"
# API_KEY = Config.SENDGRID_API_KEY
# SENDER = Config.SENDGRID_SENDER

# def send_email_sendgrid(to_email: str, subject: str, html_content: str):
#     message = Mail(
#         from_email=SENDER,
#         to_emails=to_email,
#         subject=subject,
#         html_content=html_content
#     )
    
#     try:
#         sg = SendGridAPIClient(API_KEY)
#         response = sg.send(message)
#         # SendGrid returns 202 on success
#         if response.status_code == 202:
#             return {"message": "Email sent successfully"}
#         else:
#             raise Exception(f"SendGrid API error: {response.status_code} - {response.body}")
#     except Exception as e:
#         raise Exception(f"Failed to send email: {str(e)}")


import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from config import Config


# =====================================================
# Gmail SMTP implementation
# Replaces SendGrid implementation
# =====================================================
def send_email_sendgrid(to_email: str, subject: str, html_content: str):

    msg = MIMEMultipart("alternative")
    msg["From"] = Config.EMAIL_HOST
    msg["To"] = to_email
    msg["Subject"] = subject

    msg.attach(MIMEText(html_content, "html"))

    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()

            server.login(
                Config.EMAIL_HOST,
                Config.EMAIL_PASSWORD
            )

            server.send_message(msg)

        return {"message": "Email sent successfully"}

    except Exception as e:
        raise Exception(f"Failed to send email: {str(e)}")
