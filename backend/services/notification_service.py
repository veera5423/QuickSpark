from db.mongo_client import db
from utils.sendgrid_helper import send_email_sendgrid
from datetime import datetime


def get_all_users():
    """Fetch all registered users from the database."""
    users = db.users.find({})
    return list(users)


def get_verified_users():
    """Fetch only verified users."""
    users = db.users.find({"is_verified": True})
    return list(users)


def send_notification_to_all_users(subject: str, html_content: str, only_verified: bool = False):
    """
    Send a notification email to all users (or only verified users).

    Args:
        subject: Email subject line
        html_content: HTML body of the email
        only_verified: If True, only send to verified users

    Returns:
        dict with results summary
    """
    # users = get_verified_users() if only_verified else get_all_users()
    users = get_all_users() 

    if not users:
        return {
            "total_users": 0,
            "sent": 0,
            "failed": 0,
            "errors": [],
            "message": "No users found to notify."
        }

    sent_count = 0
    failed_count = 0
    errors = []

    for user in users:
        email = user.get("email")
        username = user.get("username", "User")

        if not email:
            failed_count += 1
            continue

        # Personalize the email content with the user's name
        personalized_content = html_content.replace("{username}", username)

        try:
            send_email_sendgrid(
                to_email=email,
                subject=subject,
                html_content=personalized_content
            )
            sent_count += 1
        except Exception as e:
            failed_count += 1
            errors.append({"email": email, "error": str(e)})

    return {
        "total_users": len(users),
        "sent": sent_count,
        "failed": failed_count,
        "errors": errors,
        "message": f"Notification sent to {sent_count}/{len(users)} users."
    }


def build_announcement_html(title: str, body: str, cta_text: str = None, cta_link: str = None) -> str:
    """
    Build a styled HTML email template for announcements/notifications.
    """
    cta_section = ""
    if cta_text and cta_link:
        cta_section = f"""
        <div style="text-align:center; margin:30px 0;">
            <a href="{cta_link}" style="display:inline-block; background:#0f172a; color:white; text-decoration:none;
                padding:14px 32px; border-radius:50px; font-size:16px; font-weight:600; box-shadow:0 4px 15px rgba(15,23,42,0.3);">
                {cta_text}
            </a>
        </div>
        """

    return f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"></head>
    <body style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; margin:0; padding:0; background:#f8fafc;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc; padding:20px;">
            <tr>
                <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background:white; border-radius:20px; overflow:hidden; box-shadow:0 20px 40px rgba(0,0,0,0.08);">
                        <!-- Header -->
                        <tr>
                            <td style="background:linear-gradient(135deg,#0f172a,#14b8a6); padding:40px 30px; text-align:center;">
                                <h1 style="color:white; margin:0; font-size:28px; font-weight:800;">QuickSpark</h1>
                                <p style="color:rgba(255,255,255,0.8); margin:8px 0 0;">Study smarter, not harder</p>
                            </td>
                        </tr>
                        <!-- Body -->
                        <tr>
                            <td style="padding:40px 30px;">
                                <p style="color:#64748b; font-size:14px;">Hi {{user}},</p>
                                <h2 style="color:#0f172a; font-size:24px; font-weight:700; margin:10px 0 20px;">{title}</h2>
                                <div style="color:#475569; font-size:16px; line-height:1.8;">
                                    {body}
                                </div>
                                {cta_section}
                                <hr style="border:none; border-top:1px solid #e2e8f0; margin:30px 0;">
                                <p style="color:#94a3b8; font-size:13px; text-align:center;">
                                    You received this email because you're registered with QuickSpark.<br>
                                    If you have questions, contact us at <a href="mailto:quickspark.1help@gmail.com" style="color:#14b8a6;">quickspark.1help@gmail.com</a>
                                </p>
                            </td>
                        </tr>
                        <!-- Footer -->
                        <tr>
                            <td style="background:#f1f5f9; padding:20px 30px; text-align:center;">
                                <p style="color:#94a3b8; font-size:12px; margin:0;">&copy; 2026 QuickSpark. All rights reserved.</p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """


def build_feature_update_html(feature_name: str, description: str, benefits: list, cta_text: str = None, cta_link: str = None) -> str:
    """
    Build an HTML email template for new feature announcements.
    """
    benefits_html = "".join(
        f'<li style="padding:8px 0; color:#475569; font-size:15px;">✓ {benefit}</li>'
        for benefit in benefits
    )

    cta_section = ""
    if cta_text and cta_link:
        cta_section = f"""
        <div style="text-align:center; margin:30px 0;">
            <a href="{cta_link}" style="display:inline-block; background:#0f172a; color:white; text-decoration:none;
                padding:14px 32px; border-radius:50px; font-size:16px; font-weight:600;">
                {cta_text}
            </a>
        </div>
        """

    return f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"></head>
    <body style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; margin:0; padding:0; background:#f8fafc;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc; padding:20px;">
            <tr>
                <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background:white; border-radius:20px; overflow:hidden; box-shadow:0 20px 40px rgba(0,0,0,0.08);">
                        <tr>
                            <td style="background:linear-gradient(135deg,#0f172a,#14b8a6); padding:40px 30px; text-align:center;">
                                <div style="font-size:48px; margin-bottom:10px;">🚀</div>
                                <h1 style="color:white; margin:0; font-size:28px; font-weight:800;">New Feature!</h1>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding:40px 30px;">
                                <p style="color:#64748b; font-size:14px;">Hi {{username}},</p>
                                <h2 style="color:#0f172a; font-size:24px; font-weight:700; margin:10px 0;">{feature_name}</h2>
                                <p style="color:#475569; font-size:16px; line-height:1.8;">{description}</p>
                                <div style="background:#f8fafc; border-radius:12px; padding:20px; margin:20px 0; border-left:4px solid #14b8a6;">
                                    <h3 style="color:#0f172a; font-size:16px; font-weight:600; margin:0 0 10px;">✨ What you get:</h3>
                                    <ul style="list-style:none; padding:0; margin:0;">
                                        {benefits_html}
                                    </ul>
                                </div>
                                {cta_section}
                                <hr style="border:none; border-top:1px solid #e2e8f0; margin:30px 0;">
                                <p style="color:#94a3b8; font-size:13px; text-align:center;">
                                    You received this email because you're registered with QuickSpark.
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <td style="background:#f1f5f9; padding:20px 30px; text-align:center;">
                                <p style="color:#94a3b8; font-size:12px; margin:0;">&copy; 2026 QuickSpark. All rights reserved.</p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """

