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



import requests
from config import Config

BREVO_API_URL = "https://api.brevo.com/v3/smtp/email"
BREVO_API_KEY = Config.BREVO_API_KEY
SENDER = Config.BREVO_SENDER


def send_email_sendgrid(to_email: str, subject: str, html_content: str):
   

    headers = {
        "accept": "application/json",
        "api-key": BREVO_API_KEY,
        "content-type": "application/json",
    }

    payload = {
        "sender": {
            "name": "Flight Finder",   # Change to your app name
            "email": SENDER
        },
        "to": [
            {
                "email": to_email
            }
        ],
        "subject": subject,
        "htmlContent": html_content
    }

    try:
        response = requests.post(
            BREVO_API_URL,
            json=payload,
            headers=headers,
            timeout=30
        )

        response.raise_for_status()

        return {
            "message": "Email sent successfully"
        }

    except requests.exceptions.HTTPError:
        raise Exception(
            f"Brevo API Error ({response.status_code}): {response.text}"
        )

    except Exception as e:
        raise Exception(f"Failed to send email: {e}")












# import socket
# import smtplib
# from email.mime.multipart import MIMEMultipart
# from email.mime.text import MIMEText

# from config import Config


# # =====================================================
# # Gmail SMTP implementation
# # (SMTP, but with conservative timeouts so production doesn't hang)
# # =====================================================
# def send_email_sendgrid(to_email: str, subject: str, html_content: str):
#     # Keep the existing function name because routes already call send_email_sendgrid()
#     socket.setdefaulttimeout(15)

#     msg = MIMEMultipart("alternative")
#     msg["From"] = Config.EMAIL_HOST
#     msg["To"] = to_email
#     msg["Subject"] = subject

#     msg.attach(MIMEText(html_content, "html"))

#     server = None
#     try:
#         # timeout= controls initial connect; socket.setdefaulttimeout controls subsequent ops.
#         server = smtplib.SMTP("smtp.gmail.com", 587, timeout=15)
#         server.set_debuglevel(0)

#         server.ehlo()
#         server.starttls()
#         server.ehlo()

#         server.login(Config.EMAIL_HOST, Config.EMAIL_PASSWORD)
#         server.send_message(msg)

#         return {"message": "Email sent successfully"}

#     except Exception as e:
#         # Log detailed failure info for production debugging.
#         # (print goes to your host logs)
#         print("[MAIL][SMTP] failed")
#         print("[MAIL][SMTP] to_email=", to_email)
#         print("[MAIL][SMTP] subject=", subject)
#         print("[MAIL][SMTP] EMAIL_HOST set?", bool(Config.EMAIL_HOST))
#         print("[MAIL][SMTP] EMAIL_PASSWORD set?", bool(Config.EMAIL_PASSWORD))
#         if server is not None:
#             try:
#                 print("[MAIL][SMTP] smtp.noop()=")
#                 server.noop()
#             except Exception:
#                 pass
#         print("[MAIL][SMTP] error=", repr(e))
#         raise Exception(f"Failed to send email: {str(e)}")

#     finally:
#         if server is not None:
#             try:
#                 server.quit()
#             except Exception:
#                 pass


