from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId, errors
from datetime import datetime
from pymongo import ReturnDocument # To return updated document after verification
import re
import requests 
import uuid
from werkzeug.utils import secure_filename
from io import BytesIO
from PyPDF2 import PdfReader


# Import all collections defined in db.py
from utils.sendgrid_helper import send_email_sendgrid
from db.mongo_client import db, resources_collection, links_collection, resource_interactions_collection,Config,supabase #

public_resources_bp = Blueprint("public_resources", __name__)

# --- Helper Function: Link Metadata Scraper (MVP Simulation) ---
# NOTE: Replace this with actual YouTube/Blog API calls in production
def _scrape_link_metadata(url):
    """Simulates fetching title/duration for external link submission."""
    try:
        if 'youtube.com' in url or 'youtu.be' in url:
            platform = "YouTube"
            title = f"YouTube Video: {url.split('v=')[-1][:20]}..."
        elif re.search(r'\.(com|org|net)', url):
            # Attempt a quick fetch to get the title if possible
            # For MVP simplicity, we use hardcoded text:
            platform = "Article"
            title = f"Article: Found on {url.split('/')[2]}"
        else:
            platform = "External"
            title = f"External Resource: {url[:50]}..."
            
        return {
            "title": title,
            "platform": platform,
            "duration": "10 min read" 
        }
    except Exception:
        return {"title": f"External Link: {url[:30]}", "platform": "External", "duration": "N/A"}


# -----------------------------------------------------------------
# 1. LINK SUBMISSION (POST) - /api/public/submit-link
# -----------------------------------------------------------------
@public_resources_bp.route("/submit-link", methods=["POST"])
@jwt_required()
def submit_public_link():
    """
    Allows users to submit an external URL for public verification.
    """
    try:
        current_user_id = get_jwt_identity()
        user_obj_id = ObjectId(current_user_id)
        
        data = request.get_json()
        url = data.get("url", "").strip()
        description = data.get("description", "").strip()
        
        if not url or not re.match(r'https?://\S+', url):
            return jsonify({"message": "Invalid or missing URL."}), 400

        # 1. Scrape metadata from the URL
        metadata = _scrape_link_metadata(url)
        
        # 2. Save link metadata to the 'links' collection
        link_doc = {
            "url": url,
            "title": metadata["title"],
            "platform": metadata["platform"],
            "duration": metadata["duration"],
            "submitted_by": user_obj_id,
            "description": description,
            "created_at": datetime.utcnow()
        }
        link_result = links_collection.insert_one(link_doc)
        
        # 3. Create the main resource entry (linking the submitted link)
        resource_doc = {
            "user_id": user_obj_id,
            "type": "link", 
            "original_filename": metadata["title"],
            "link_id": link_result.inserted_id, 
            "public_url": url,
            "summary": description or metadata.get('title'),
            "is_public": True,
            "verification_status": "pending", 
            "created_at": datetime.utcnow()
        }
        resource_result = resources_collection.insert_one(resource_doc)

        return jsonify({
            "message": "Resource submitted for verification. Thank you!",
            "resource_id": str(resource_result.inserted_id),
            "status": "pending"
        }), 201

    except errors.InvalidId:
        return jsonify({"message": "Invalid user ID"}), 400
    except Exception as e:
        print(f"Error submitting public link: {e}")
        return jsonify({"message": f"Server error: {str(e)}"}), 500


# -----------------------------------------------------------------
# 2. ADMIN ACTIONS (Verification & Notification) - /api/public/admin/verify/<id>
# -----------------------------------------------------------------
@public_resources_bp.route("/admin/verify/<resource_id>", methods=["OPTIONS"])
def verify_resource_options(resource_id):
    return jsonify({}), 200


@public_resources_bp.route("/admin/verify/<resource_id>", methods=["POST"], provide_automatic_options=False)
@jwt_required()
def verify_resource(resource_id):
    """
    (Admin-only) Sets a resource to 'verified' and triggers email notification.
    """
    try:
        # 🚨 ADMIN CHECK HERE: Add logic to verify current user is admin
        
        resource_obj_id = ObjectId(resource_id)
        userId=resources_collection.find_one({"_id":resource_obj_id})["user_id"]
        
        # 1. Update the resource status in MongoDB
        resource = resources_collection.find_one_and_update(
            {"_id": resource_obj_id},
            {"$set": {
                "verification_status": "verified",
                "is_public": True,
                "updated_at": datetime.utcnow()
            }},
            return_document=ReturnDocument.AFTER
        )
        resource_link=resource.get('public_url')

          


        if not resource:
            return jsonify({"message": "Resource not found"}), 404
        
        # --- 2. NOTIFICATION LOGIC (Using existing email service) ---
        user_doc = db.users.find_one({"_id": userId})
        userMail = user_doc.get("email") if user_doc else None
        subject = "✨ Your Resource Has Been Verified!"
        # Send contributor notification as HTML
        contributor_html = f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Your Resource is Live! - QuickSpark</title>
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
                }}
                .success-icon {{
                    font-size: 64px;
                    text-align: center;
                    margin-bottom: 20px;
                }}
                .content h2 {{
                    color: #333;
                    font-size: 24px;
                    margin-bottom: 20px;
                    font-weight: 500;
                    text-align: center;
                }}
                .content p {{
                    color: #666;
                    font-size: 16px;
                    line-height: 1.6;
                    margin-bottom: 20px;
                }}
                .resource-card {{
                    background: #f8f9fa;
                    border-radius: 15px;
                    padding: 25px;
                    margin: 25px 0;
                    border-left: 5px solid #4CAF50;
                }}
                .resource-title {{
                    font-size: 18px;
                    font-weight: 600;
                    color: #333;
                    margin-bottom: 10px;
                }}
                .view-btn {{
                    display: inline-block;
                    background: linear-gradient(135deg, #4CAF50, #45a049);
                    color: white;
                    text-decoration: none;
                    padding: 15px 30px;
                    border-radius: 50px;
                    font-weight: 600;
                    font-size: 16px;
                    box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
                    transition: all 0.3s ease;
                    margin: 20px 0;
                }}
                .view-btn:hover {{
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
                }}
                .stats {{
                    background: #e8f5e8;
                    border-radius: 10px;
                    padding: 20px;
                    margin-top: 20px;
                    text-align: center;
                }}
                .stats h3 {{
                    color: #2e7d32;
                    margin-bottom: 10px;
                    font-size: 16px;
                }}
                .stats p {{
                    color: #2e7d32;
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
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="spark-icon">✨</div>
                    <h1>QuickSpark</h1>
                </div>
                <div class="content">
                    <div class="success-icon">🎉</div>
                    <h2>Congratulations, Contributor!</h2>
                    <p>Great news! Your submitted resource has been reviewed and approved by our expert team. It's now live and available to help learners worldwide!</p>
                    
                    <div class="resource-card">
                        <div class="resource-title">📚 {resource.get('original_filename')}</div>
                        <p>Your contribution is now part of our growing library of quality learning resources.</p>
                    </div>
                    
                    <center>
                        <a href="{resource_link}" class="view-btn">View Your Resource</a>
                    </center>
                    
                    <div class="stats">
                        <h3>🌟 Impact</h3>
                        <p>Your resource will now help countless learners on their journey to success!</p>
                    </div>
                    
                    <p>Thank you for being an invaluable part of the QuickSpark community. Keep contributing and making a difference!</p>
                </div>
                <div class="footer">
                    <p><strong>QuickSpark Community Team</strong></p>
                    <p>Empowering learners through collaborative knowledge sharing</p>
                    <p style="font-size: 12px; margin-top: 15px;">
                        Want to contribute more? <a href="https://quick-spark.vercel.app/dashboard/submit-resource" style="color: #4CAF50;">Submit another resource</a>
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
        send_email_sendgrid(userMail, subject, contributor_html)



        
        # Fetch ALL users for notification
        # Assuming db.users is available and contains an 'email' field
        all_users_cursor = db.users.find({}, {"email": 1, "_id": 0})
        
        frontend_base_url = "https://quick-spark.vercel.app/" 
        # resource_link = f"{frontend_base_url}/dashboard/public-resources/{resource.get('resource_uuid') or resource_id}"
        resource_title = resource.get('original_filename') or 'New Resource'
        
        # NOTE: You must import your existing send_email_notification helper
        # from utils.email_helper import send_email_notification 

        notification_count = 0
        subject = f"✨ New Verified Resource: {resource_title}"
        # HTML-formatted broadcast to learners
        broadcast_html = f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Resource Available! - QuickSpark</title>
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
                    background: linear-gradient(135deg, #9C27B0, #7B1FA2);
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
                .announcement-icon {{
                    font-size: 64px;
                    text-align: center;
                    margin-bottom: 20px;
                }}
                .content h2 {{
                    color: #333;
                    font-size: 24px;
                    margin-bottom: 20px;
                    font-weight: 500;
                    text-align: center;
                }}
                .content p {{
                    color: #666;
                    font-size: 16px;
                    line-height: 1.6;
                    margin-bottom: 20px;
                }}
                .resource-highlight {{
                    background: linear-gradient(135deg, #f3e5f5, #e1bee7);
                    border-radius: 15px;
                    padding: 25px;
                    margin: 25px 0;
                    border-left: 5px solid #9C27B0;
                    text-align: center;
                }}
                .resource-title {{
                    font-size: 20px;
                    font-weight: 600;
                    color: #333;
                    margin-bottom: 15px;
                }}
                .resource-badge {{
                    display: inline-block;
                    background: #9C27B0;
                    color: white;
                    padding: 8px 16px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-bottom: 15px;
                }}
                .access-btn {{
                    display: inline-block;
                    background: linear-gradient(135deg, #9C27B0, #7B1FA2);
                    color: white;
                    text-decoration: none;
                    padding: 15px 30px;
                    border-radius: 50px;
                    font-weight: 600;
                    font-size: 16px;
                    box-shadow: 0 4px 15px rgba(156, 39, 176, 0.3);
                    transition: all 0.3s ease;
                    margin: 20px 0;
                }}
                .access-btn:hover {{
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(156, 39, 176, 0.4);
                }}
                .benefits {{
                    background: #f8f9fa;
                    border-radius: 15px;
                    padding: 25px;
                    margin: 25px 0;
                }}
                .benefits h3 {{
                    color: #333;
                    font-size: 18px;
                    margin-bottom: 15px;
                    text-align: center;
                }}
                .benefit-list {{
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 15px;
                }}
                .benefit-item {{
                    display: flex;
                    align-items: center;
                    padding: 10px;
                    background: white;
                    border-radius: 10px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }}
                .benefit-icon {{
                    font-size: 20px;
                    margin-right: 10px;
                    color: #9C27B0;
                }}
                .benefit-text {{
                    font-size: 14px;
                    color: #333;
                    font-weight: 500;
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
                    .benefit-list {{
                        grid-template-columns: 1fr;
                    }}
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="spark-icon">📚</div>
                    <h1>QuickSpark</h1>
                </div>
                <div class="content">
                    <div class="announcement-icon">🔔</div>
                    <h2>New Learning Resource Available!</h2>
                    <p>Exciting news! Our community has added a brand new verified resource to help you on your learning journey.</p>
                    
                    <div class="resource-highlight">
                        <div class="resource-badge">New Resource</div>
                        <div class="resource-title">{resource_title}</div>
                        <p>This resource has been carefully reviewed and approved by our expert team for quality and relevance.</p>
                    </div>
                    
                    <center>
                        <a href="{resource_link}" class="access-btn">Access Resource Now</a>
                    </center>
                    
                    <div class="benefits">
                        <h3>Why explore this resource?</h3>
                        <div class="benefit-list">
                            <div class="benefit-item">
                                <span class="benefit-icon">✅</span>
                                <span class="benefit-text">Expert Reviewed</span>
                            </div>
                            <div class="benefit-item">
                                <span class="benefit-icon">🎯</span>
                                <span class="benefit-text">High Quality Content</span>
                            </div>
                            <div class="benefit-item">
                                <span class="benefit-icon">🚀</span>
                                <span class="benefit-text">Career Focused</span>
                            </div>
                            <div class="benefit-item">
                                <span class="benefit-icon">🌟</span>
                                <span class="benefit-text">Community Approved</span>
                            </div>
                        </div>
                    </div>
                    
                    <p>Keep learning, keep growing! The QuickSpark community is here to support your success.</p>
                </div>
                <div class="footer">
                    <p><strong>QuickSpark Learning Community</strong></p>
                    <p>Growing together through shared knowledge</p>
                    <p style="font-size: 12px; margin-top: 15px;">
                        Don't want these notifications? <a href="#" style="color: #9C27B0;">Update your preferences</a>
                    </p>
                </div>
            </div>
        </body>
        </html>
        """

        for user_doc in all_users_cursor:
            recipient_email = user_doc.get('email')
            if recipient_email:
                try:
                    send_email_sendgrid(recipient_email, subject, broadcast_html)
                    print(f"DEBUG: Email sent to {recipient_email}")
                    notification_count += 1
                except Exception as mail_err:
                    print(f"Failed to send email to {recipient_email}: {mail_err}")
        
        # --- 3. AUTO-UPGRADE CHECK ---
        try:
            # Increment verified upload counter for the contributor
            updated_user = db.users.find_one_and_update(
                {"_id": userId},
                {"$inc": {"verified_upload_count": 1}},
                return_document=ReturnDocument.AFTER
            )
            verified_count = updated_user.get('verified_upload_count', 0) if updated_user else 0

            # If contributor reaches threshold and isn't already Pro, auto-upgrade
            AUTO_UPGRADE_THRESHOLD = 3
            if verified_count >= AUTO_UPGRADE_THRESHOLD and not (updated_user.get('is_pro_member', False) if updated_user else False):
                db.users.update_one(
                    {"_id": userId},
                    {"$set": {
                        "is_pro_member": True,
                        "pro_upgraded_at": datetime.utcnow(),
                        "pro_upgraded_by": "auto"
                    }}
                )
                try:
                    upgrade_subject = "🎉 You've been upgraded to QuickSpark Pro!"
                    upgrade_html = f"""
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Congratulations! You're Now Pro - QuickSpark</title>
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
                                background: linear-gradient(135deg, #FFD700, #FFA000);
                                color: white;
                                padding: 40px 30px;
                                text-align: center;
                                position: relative;
                            }}
                            .header h1 {{
                                margin: 0;
                                font-size: 28px;
                                font-weight: 600;
                            }}
                            .crown-icon {{
                                font-size: 64px;
                                margin-bottom: 10px;
                            }}
                            .content {{
                                padding: 40px 30px;
                            }}
                            .celebration-icon {{
                                font-size: 64px;
                                text-align: center;
                                margin-bottom: 20px;
                            }}
                            .content h2 {{
                                color: #333;
                                font-size: 24px;
                                margin-bottom: 20px;
                                font-weight: 500;
                                text-align: center;
                            }}
                            .content p {{
                                color: #666;
                                font-size: 16px;
                                line-height: 1.6;
                                margin-bottom: 20px;
                            }}
                            .pro-badge {{
                                background: linear-gradient(135deg, #FFD700, #FFA000);
                                color: white;
                                padding: 15px 25px;
                                border-radius: 50px;
                                text-align: center;
                                font-weight: 600;
                                font-size: 18px;
                                margin: 25px 0;
                                box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
                            }}
                            .features {{
                                background: #fff8e1;
                                border-radius: 15px;
                                padding: 25px;
                                margin: 25px 0;
                                border-left: 5px solid #FFD700;
                            }}
                            .features h3 {{
                                color: #333;
                                font-size: 18px;
                                margin-bottom: 15px;
                                text-align: center;
                            }}
                            .feature-grid {{
                                display: grid;
                                grid-template-columns: 1fr 1fr;
                                gap: 15px;
                            }}
                            .feature-item {{
                                display: flex;
                                align-items: center;
                                padding: 12px;
                                background: white;
                                border-radius: 10px;
                                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                            }}
                            .feature-icon {{
                                font-size: 20px;
                                margin-right: 10px;
                                color: #FFD700;
                            }}
                            .feature-text {{
                                font-size: 14px;
                                color: #333;
                                font-weight: 500;
                            }}
                            .explore-btn {{
                                display: inline-block;
                                background: linear-gradient(135deg, #FFD700, #FFA000);
                                color: white;
                                text-decoration: none;
                                padding: 15px 30px;
                                border-radius: 50px;
                                font-weight: 600;
                                font-size: 16px;
                                box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
                                transition: all 0.3s ease;
                                margin: 20px 0;
                            }}
                            .explore-btn:hover {{
                                transform: translateY(-2px);
                                box-shadow: 0 6px 20px rgba(255, 215, 0, 0.4);
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
                                .feature-grid {{
                                    grid-template-columns: 1fr;
                                }}
                            }}
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <div class="crown-icon">👑</div>
                                <h1>QuickSpark Pro</h1>
                            </div>
                            <div class="content">
                                <div class="celebration-icon">🎉</div>
                                <h2>Congratulations, {user_doc.get('name', '') if user_doc else 'Contributor'}!</h2>
                                <p>We're absolutely thrilled with your contributions to the QuickSpark community! As a token of our appreciation, we've automatically upgraded your account to <strong>Pro status</strong>.</p>
                                
                                <div class="pro-badge">
                                    ✨ You're Now a QuickSpark Pro Member! ✨
                                </div>
                                
                                <div class="features">
                                    <h3>Your New Pro Benefits</h3>
                                    <div class="feature-grid">
                                        <div class="feature-item">
                                            <span class="feature-icon">📄</span>
                                            <span class="feature-text">Advanced Resume Analysis</span>
                                        </div>
                                        <div class="feature-item">
                                            <span class="feature-icon">🤖</span>
                                            <span class="feature-text">Extended AI Usage</span>
                                        </div>
                                        <div class="feature-item">
                                            <span class="feature-icon">⚡</span>
                                            <span class="feature-text">Priority Processing</span>
                                        </div>
                                        <div class="feature-item">
                                            <span class="feature-icon">🏆</span>
                                            <span class="feature-text">Exclusive Pro Features</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <p>You've earned this upgrade by contributing {verified_count} high-quality resources to our community. Keep up the amazing work!</p>
                                
                                <center>
                                    <a href="https://quick-spark.vercel.app/dashboard" class="explore-btn">Explore Pro Features</a>
                                </center>
                                
                                <p>Welcome to the Pro community! We're excited to see what you'll accomplish with your enhanced capabilities.</p>
                            </div>
                            <div class="footer">
                                <p><strong>QuickSpark Pro Team</strong></p>
                                <p>Excellence rewarded, potential unleashed</p>
                                <p style="font-size: 12px; margin-top: 15px;">
                                    Questions about Pro features? <a href="mailto:pro-support@quickspark.com" style="color: #FFD700;">Contact Pro Support</a>
                                </p>
                            </div>
                        </div>
                    </body>
                    </html>
                    """
                    if userMail:
                        send_email_sendgrid(userMail, upgrade_subject, upgrade_html)
                except Exception as mail_err:
                    print(f"Failed to send upgrade email to {userMail}: {mail_err}")
        except Exception as au_err:
            print(f"Auto-upgrade check failed: {au_err}")

        return jsonify({
            "message": f"Resource '{resource_title}' verified and {notification_count} notifications triggered.",
            "status": "verified"
        }), 200

    except Exception as e:
        print(f"Error verifying resource: {e}")
        return jsonify({"message": f"Server error: {str(e)}"}), 500


# -----------------------------------------------------------------
# 3. INTERACTION ENDPOINTS (Like/Dislike/Report) - /api/public/interact
# -----------------------------------------------------------------
@public_resources_bp.route("/interact/<resource_id>", methods=["POST"])
@jwt_required()
def handle_resource_interaction(resource_id):
    """
    Handles 'like', 'dislike', and 'report' actions on a resource.
    """
    try:
        current_user_id = get_jwt_identity()
        user_obj_id = ObjectId(current_user_id)
        
        # Allow preflight OPTIONS to succeed without authentication
        if request.method == 'OPTIONS':
            return jsonify({}), 200

        data = request.get_json()
        action_type = data.get("action_type")
        report_reason = data.get("reason")

        if action_type not in ['like', 'dislike', 'report']:
            return jsonify({"message": "Invalid action type."}), 400

        # Helper: compute current like/dislike counts for the resource
        def _get_counts(rid):
            likes = resource_interactions_collection.count_documents({"resource_id": rid, "action_type": "like"})
            dislikes = resource_interactions_collection.count_documents({"resource_id": rid, "action_type": "dislike"})
            return {"likes": likes, "dislikes": dislikes}

        # Handle like/dislike as a toggle: a user can have at most one like/dislike per resource.
        if action_type in ['like', 'dislike']:
            # Find existing like/dislike (if any)
            existing = resource_interactions_collection.find_one({
                "user_id": user_obj_id,
                "resource_id": resource_id,
                "action_type": {"$in": ["like", "dislike"]}
            })

            # If same action exists -> toggle off (remove)
            if existing and existing.get('action_type') == action_type:
                resource_interactions_collection.delete_one({"_id": existing['_id']})
                counts = _get_counts(resource_id)
                return jsonify({"message": f"Removed '{action_type}'","status": "removed", "counts": counts}), 200

            # If opposite action exists -> switch it to the new action (update)
            if existing and existing.get('action_type') != action_type:
                resource_interactions_collection.update_one(
                    {"_id": existing['_id']},
                    {"$set": {"action_type": action_type, "updated_at": datetime.utcnow()}},
                )
                counts = _get_counts(resource_id)
                print(counts['likes'])
                resources_collection.update_one(
                    {"_id": ObjectId(resource_id)},
                    {"$set": {
                    "likes": counts['likes'],
                    "dislikes": counts['dislikes']
                    }}
                )
                return jsonify({"message": f"Action switched to '{action_type}'","status": "success", "counts": counts}), 200

            # No existing like/dislike -> insert new one
            interaction_doc = {
                "resource_id": resource_id,
                "user_id": user_obj_id,
                "action_type": action_type,
                "created_at": datetime.utcnow(),
            }
            resource_interactions_collection.insert_one(interaction_doc)
            counts= _get_counts(resource_id)
            print(counts)
            resources_collection.update_one(
                {"_id": ObjectId(resource_id)},
                {"$set": {
                    "likes": counts['likes'],
                    "dislikes": counts['dislikes']
                }}
            )
            return jsonify({"message": f"Action '{action_type}' recorded successfully.", "status": "success", "counts": counts}), 201
        
          # Placeholder for future use

        # Reports are recorded as separate documents (allow multiple reports)
        if action_type == 'report':
            interaction_doc = {
                "resource_id": resource_id,
                "user_id": user_obj_id,
                "action_type": action_type,
                "report_reason": report_reason,
                "created_at": datetime.utcnow(),
            }
            resource_interactions_collection.insert_one(interaction_doc)
            # FUTURE: Add Admin notification logic here
            counts = _get_counts(resource_id)
            return jsonify({"message": "Report recorded successfully.", "status": "reported", "counts": counts}), 201

    except errors.InvalidId:
        return jsonify({"message": "Invalid user ID or Resource ID"}), 400
    except Exception as e:
        print(f"Error handling interaction: {e}")
        return jsonify({"message": f"Server error: {str(e)}"}), 500

# -----------------------------------------------------------------
# 4. SEARCH ENDPOINT (Public View) - /api/public/public-search
# -----------------------------------------------------------------
@public_resources_bp.route("/public-search", methods=["GET"])
@jwt_required()
def public_resource_search():
    """
    Fetches all verified public resources (Links and PDFs), supporting text search.
    """
    try:
        search_query = request.args.get('q', '').strip()
        
        # Base filter: Only fetch VERIFIED public resources
        query_filter = {
            "is_public": True,
            "verification_status": "verified"
        }
        
        if search_query:
            # Add text search filter (searching against the title/filename)
            query_filter['original_filename'] = {"$regex": search_query, "$options": "i"} # Case-insensitive regex search
            
        # 1. Fetch verified resources
        verified_resources = list(resources_collection.find(query_filter).sort("created_at", -1))
        
        # 2. Gather IDs for necessary lookups
        link_ids = [r['link_id'] for r in verified_resources if r.get('link_id')]
        resource_ids = [r['_id'] for r in verified_resources]
        
        link_details = {}
        if link_ids:
            links_cursor = links_collection.find({"_id": {"$in": link_ids}})
            for link in links_cursor:
                link_details[link['_id']] = link
                
        # 3. Fetch all current Likes/Dislikes for the fetched resources (for display)
        stats_pipeline = [
            {"$match": {"resource_id": {"$in": [str(rid) for rid in resource_ids]}, "action_type": {"$in": ["like", "dislike"]}}},
            {"$group": {
                "_id": {"resource_id": "$resource_id", "action": "$action_type"},
                "count": {"$sum": 1}
            }}
        ]
        
        # raw_stats = list(resource_interactions_collection.aggregate(stats_pipeline))
        
        # # Convert raw stats into a map keyed by resource ID
        # stats_map = {}
        # for stat in raw_stats:
        #     res_id = stat['_id']['resource_id']
        #     if res_id not in stats_map:
        #         stats_map[res_id] = {'likes': 0, 'dislikes': 0}
        #     stats_map[res_id][stat['_id']['action']] = stat['count']
        
        # 4. Final Data Compilation
        final_output = []
        for resource in verified_resources:
            link_info = link_details.get(resource.get('link_id'))
            
            # --- Serialization ---
            res_id_str = str(resource['_id'])

            output = {
                "id": res_id_str, # Used for Frontend key and interactions
                "type": resource.get('type'),
                "filename": resource.get('original_filename'),
                "description": resource.get('summary', 'No summary available.'),
                "review_source": link_info['url'] if link_info else resource.get('public_url'),
                "likes": resource.get('likes', 0),
                
                "dislikes": resource.get('dislikes', 0),
                "platform": link_info['platform'] if link_info else 'PDF'
            }
            final_output.append(output)

        return jsonify({"resources": final_output}), 200

    except Exception as e:
        print(f"Error fetching public resources: {e}")
        return jsonify({"message": f"Server error: {str(e)}"}), 500
    
  



# -----------------------------------------------------------------
# 5. PDF SUBMISSION (POST) - /api/public/submit-pdf
# -----------------------------------------------------------------
@public_resources_bp.route("/submit-pdf", methods=["POST"])
@jwt_required()
def submit_public_pdf():
    """
    Allows users to upload a PDF for public submission and admin verification.
    This skips the automatic summarization/embedding step.
    """
    try:
        current_user_id = get_jwt_identity()
        
        if "file" not in request.files:
            return jsonify({"message": "No file part"}), 400
        
        file = request.files["file"]
        if not file.filename.lower().endswith(".pdf"):
            return jsonify({"message": "Only PDF files are supported."}), 400
        
        filename = secure_filename(file.filename)
        description = request.form.get('description', '').strip()
        file_bytes = file.read()
        file_size = len(file_bytes)
        
        # 1. Upload to Supabase Storage
        resource_uuid = str(uuid.uuid4())
        storage_path = f"{current_user_id}/public/{resource_uuid}.pdf" # ◀️ Note: New public folder path
        
        supabase.storage.from_(Config.SUPABASE_BUCKET).upload(
            path=storage_path,
            file=file_bytes,
            file_options={"content-type": file.content_type}
        )
        public_url = supabase.storage.from_(Config.SUPABASE_BUCKET).get_public_url(storage_path)

        # 2. Extract Page Count (For metadata)
        pdf_reader_for_pages = PdfReader(BytesIO(file_bytes))
        page_count = len(pdf_reader_for_pages.pages)
        
        # 3. Save Metadata to MongoDB (Status: Pending)
        resource_doc = {
            "user_id": ObjectId(current_user_id),
            "type": "pdf", 
            "original_filename": filename,
            "resource_uuid": resource_uuid,
            "storage_path": storage_path,
            "public_url": public_url,
            "is_public": True,
            "verification_status": "pending", # 🚨 KEY DIFFERENCE: Pending review
            "summary": description or None, # Use provided description as initial summary
            "created_at": datetime.utcnow(),
            "metadata": {
                "file_size_kb": file_size / 1024,
                "page_count": page_count
            }
        }
        result = resources_collection.insert_one(resource_doc)

        return jsonify({
            "message": "PDF submitted for admin verification. Thank you!",
            "resource_id": str(result.inserted_id),
            "status": "pending"
        }), 201

    except Exception as e:
        # Rollback Supabase upload if MongoDB fails
        if resource_uuid:
            supabase.storage.from_(Config.SUPABASE_BUCKET).remove([storage_path])
        print(f"Error submitting public PDF: {e}")
        return jsonify({"message": f"Server error: {str(e)}"}), 500
    

# # -----------------------------------------------------------------
# # PDF PROXY ROUTE - /api/public/pdf-proxy
# # -----------------------------------------------------------------
# @public_resources_bp.route("/pdf-proxy", methods=["GET"])
# def proxy_pdf():
#     """
#     Proxies PDF requests to avoid CORS issues with S3/Supabase.
#     Expects a 'url' query parameter with the PDF URL.
#     """
#     try:
#         pdf_url = request.args.get('url')
#         if not pdf_url:
#             return jsonify({"message": "Missing 'url' parameter"}), 400
            
#         # Validate that this is a request for a public resource
#         # You might want to add additional validation here
        
#         # Fetch the PDF from the external URL
#         response = requests.get(pdf_url, timeout=30)
#         response.raise_for_status()
        
#         # Return the PDF with appropriate headers
#         return response.content, 200, {
#             'Content-Type': 'application/pdf',
#             'Content-Disposition': 'inline',
#             'Cache-Control': 'public, max-age=3600'  # Cache for 1 hour
#         }
        
#     except requests.exceptions.RequestException as e:
#         print(f"Error proxying PDF: {e}")
#         return jsonify({"message": "Failed to fetch PDF"}), 500
#     except Exception as e:
#         print(f"Unexpected error in PDF proxy: {e}")
#         return jsonify({"message": "Server error"}), 500
