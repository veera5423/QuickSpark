from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId, errors
from datetime import datetime

from db.mongo_client import db, users_collection
from utils.sendgrid_helper import send_email_sendgrid

user_requests_bp = Blueprint("user_requests", __name__)


@user_requests_bp.before_request
def _handle_options_preflight():
    # Ensure OPTIONS preflight requests do not require authentication
    from flask import request
    if request.method == 'OPTIONS':
        return jsonify({}), 200


@user_requests_bp.route("/request-pro", methods=["POST"], provide_automatic_options=False)
@jwt_required()
def request_pro():
    """User requests Pro access — record request and notify admins."""
    try:
        current_user_id = get_jwt_identity()
        user_obj_id = ObjectId(current_user_id)
        data = request.get_json() or {}
        message = data.get("message", "")

        user_doc = users_collection.find_one({"_id": user_obj_id}, {"email": 1, "name": 1})
        user_email = user_doc.get("email") if user_doc else None
        user_name = user_doc.get("name") if user_doc else None

        # Record request
        req_doc = {
            "user_id": user_obj_id,
            "email": user_email,
            "name": user_name,
            "message": message,
            "status": "pending",
            "created_at": datetime.utcnow()
        }
        db.pro_requests.insert_one(req_doc)

        # Notify admins
        admins_cursor = users_collection.find({"is_admin": True}, {"email": 1})
        subject = f"🚨 Pro Access Request from {user_email or 'a user'}"
        html = f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Pro Access Request - QuickSpark Admin</title>
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
                    background: linear-gradient(135deg, #FF5722, #D84315);
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
                .alert-icon {{
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
                .user-info {{
                    background: #fff3e0;
                    border-radius: 15px;
                    padding: 25px;
                    margin: 25px 0;
                    border-left: 5px solid #FF5722;
                }}
                .user-detail {{
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 10px;
                    padding: 8px 0;
                    border-bottom: 1px solid #ffe0b2;
                }}
                .user-detail:last-child {{
                    border-bottom: none;
                    margin-bottom: 0;
                }}
                .label {{
                    font-weight: 600;
                    color: #333;
                }}
                .value {{
                    color: #666;
                }}
                .message-section {{
                    background: #f8f9fa;
                    border-radius: 15px;
                    padding: 25px;
                    margin: 25px 0;
                }}
                .message-section h3 {{
                    color: #333;
                    font-size: 18px;
                    margin-bottom: 15px;
                }}
                .user-message {{
                    background: white;
                    border-radius: 10px;
                    padding: 20px;
                    border: 2px solid #e9ecef;
                    color: #333;
                    line-height: 1.6;
                    font-style: italic;
                }}
                .action-buttons {{
                    text-align: center;
                    margin-top: 30px;
                }}
                .review-btn {{
                    display: inline-block;
                    background: linear-gradient(135deg, #FF5722, #D84315);
                    color: white;
                    text-decoration: none;
                    padding: 15px 30px;
                    border-radius: 50px;
                    font-weight: 600;
                    font-size: 16px;
                    box-shadow: 0 4px 15px rgba(255, 87, 34, 0.3);
                    transition: all 0.3s ease;
                    margin: 10px;
                }}
                .review-btn:hover {{
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(255, 87, 34, 0.4);
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
                .priority-badge {{
                    display: inline-block;
                    background: #FF5722;
                    color: white;
                    padding: 5px 12px;
                    border-radius: 15px;
                    font-size: 12px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-bottom: 15px;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="spark-icon">🚨</div>
                    <h1>QuickSpark Admin</h1>
                </div>
                <div class="content">
                    <div class="alert-icon">📬</div>
                    <div class="priority-badge">Priority Request</div>
                    <h2>New Pro Access Request</h2>
                    <p>A user has submitted a request for Pro access. Please review and take appropriate action.</p>
                    
                    <div class="user-info">
                        <div class="user-detail">
                            <span class="label">Name:</span>
                            <span class="value">{user_name or 'Not provided'}</span>
                        </div>
                        <div class="user-detail">
                            <span class="label">Email:</span>
                            <span class="value">{user_email or 'Not provided'}</span>
                        </div>
                        <div class="user-detail">
                            <span class="label">User ID:</span>
                            <span class="value">{current_user_id}</span>
                        </div>
                        <div class="user-detail">
                            <span class="label">Request Date:</span>
                            <span class="value">{datetime.utcnow().strftime('%B %d, %Y at %I:%M %p UTC')}</span>
                        </div>
                    </div>
                    
                    {f'''
                    <div class="message-section">
                        <h3>User Message</h3>
                        <div class="user-message">
                            {message}
                        </div>
                    </div>
                    ''' if message else ''}
                    
                    <div class="action-buttons">
                        <a href="https://quick-spark.vercel.app/dashboard/admin" class="review-btn">Review in Admin Panel</a>
                    </div>
                    
                    <p>Please evaluate this request based on our Pro access criteria and respond promptly.</p>
                </div>
                <div class="footer">
                    <p><strong>QuickSpark Admin System</strong></p>
                    <p>Automated request notification</p>
                    <p style="font-size: 12px; margin-top: 15px;">
                        This is an automated message. Please do not reply directly to this email.
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
        for admin in admins_cursor:
            admin_email = admin.get("email")
            if admin_email:
                try:
                    send_email_sendgrid(admin_email, subject, html)
                except Exception as e:
                    print(f"Failed to send pro request email to {admin_email}: {e}")

        return jsonify({"message": "Pro request recorded. Admins notified."}), 201
    except Exception as e:
        print(f"Error recording pro request: {e}")
        return jsonify({"message": f"Server error: {str(e)}"}), 500


# CORS preflight handler (no auth required)
@user_requests_bp.route("/request-pro", methods=["OPTIONS"])
def request_pro_options():
    return jsonify({}), 200

@user_requests_bp.route("/get-user-requests", methods=["OPTIONS"])
def get_user_requests_options():
    return jsonify({}), 200

@user_requests_bp.route("/user-requests/<request_id>/resolve", methods=["OPTIONS"])
def resolve_user_request_options():
    return jsonify({}), 200




@user_requests_bp.route("/get-user-requests", methods=["GET",], provide_automatic_options=False)
@jwt_required()
def get_user_requests():
    """Admin retrieves all user requests for Pro access."""
    try:
        current_user_id = get_jwt_identity()
        user_obj_id = ObjectId(current_user_id)

        user_doc = users_collection.find_one({"_id": user_obj_id}, {"is_admin": 1})
        if not user_doc or not user_doc.get("is_admin", False):
            return jsonify({"message": "Unauthorized"}), 403

        requests_cursor = list(db.pro_requests.find().sort("created_at", -1))

        # Hydrate with latest user info (email, pro status)
        user_ids = {req.get("user_id") for req in requests_cursor if req.get("user_id")}
        users_map = {
            doc["_id"]: {
                "email": doc.get("email"),
                "is_pro_member": doc.get("is_pro_member", False),
                "name": doc.get("name") or doc.get("username"),
            }
            for doc in users_collection.find({"_id": {"$in": list(user_ids)}}, {"email": 1, "is_pro_member": 1, "name": 1, "username": 1})
        }

        requests_list = []
        for req in requests_cursor:
            user_meta = users_map.get(req.get("user_id"), {})
            req["email"] = req.get("email") or user_meta.get("email")
            req["is_pro_member"] = bool(user_meta.get("is_pro_member", False))
            if not req.get("name"):
                req["name"] = user_meta.get("name")
            req["_id"] = str(req["_id"])
            req["user_id"] = str(req["user_id"])
            req["created_at"] = req["created_at"].isoformat() + "Z"
            if req.get("resolved_at"):
                req["resolved_at"] = req["resolved_at"].isoformat() + "Z"
            if req.get("resolved_by"):
                req["resolved_by"] = str(req["resolved_by"])
            requests_list.append(req)

        return jsonify({"requests": requests_list}), 200
    except Exception as e:
        print(f"Error retrieving pro requests: {e}")
        return jsonify({"message": f"Server error: {str(e)}"}), 500


@user_requests_bp.route("/user-requests/<request_id>/resolve", methods=["POST"], provide_automatic_options=False)
@jwt_required()
def resolve_user_request(request_id):
    """Admin marks a Pro request as approved or rejected and optionally upgrades user."""
    try:
        current_user_id = get_jwt_identity()
        admin_obj_id = ObjectId(current_user_id)

        admin_doc = users_collection.find_one({"_id": admin_obj_id}, {"is_admin": 1})
        if not admin_doc or not admin_doc.get("is_admin", False):
            return jsonify({"message": "Unauthorized"}), 403

        data = request.get_json() or {}
        action = data.get("action", "approve")
        notes = data.get("notes", "")

        if action not in ["approve", "reject"]:
            return jsonify({"message": "Invalid action"}), 400

        try:
            request_obj_id = ObjectId(request_id)
        except errors.InvalidId:
            return jsonify({"message": "Invalid request id"}), 400

        req_doc = db.pro_requests.find_one({"_id": request_obj_id})
        if not req_doc:
            return jsonify({"message": "Request not found"}), 404

        updates = {
            "status": "approved" if action == "approve" else "rejected",
            "resolved_at": datetime.utcnow(),
            "resolved_by": admin_obj_id,
            "notes": notes
        }

        if action == "approve":
            users_collection.update_one(
                {"_id": req_doc["user_id"]},
                {"$set": {"is_pro_member": True}}
            )

        db.pro_requests.update_one({"_id": request_obj_id}, {"$set": updates})

        # Notify requester about the decision when we have their email
        requester_email = req_doc.get("email")
        if not requester_email and req_doc.get("user_id"):
            user_lookup = users_collection.find_one({"_id": req_doc.get("user_id")}, {"email": 1})
            requester_email = user_lookup.get("email") if user_lookup else None

        if requester_email:
            decision = "approved" if action == "approve" else "rejected"
            subject = f"{'🎉' if action == 'approve' else '📋'} Your Pro Access Request Has Been {decision.title()}"
            html_parts = [
                f"""
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Pro Access Request {decision.title()} - QuickSpark</title>
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
                            background: linear-gradient(135deg, {'#4CAF50' if action == 'approve' else '#f44336'}, {'#45a049' if action == 'approve' else '#d32f2f'});
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
                        .decision-icon {{
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
                        .status-banner {{
                            background: {'#e8f5e8' if action == 'approve' else '#ffebee'};
                            border: 2px solid {'#4CAF50' if action == 'approve' else '#f44336'};
                            border-radius: 15px;
                            padding: 25px;
                            margin: 25px 0;
                            text-align: center;
                        }}
                        .status-text {{
                            font-size: 20px;
                            font-weight: 600;
                            color: {'#2e7d32' if action == 'approve' else '#c62828'};
                            margin-bottom: 10px;
                        }}
                        .status-icon {{
                            font-size: 32px;
                            margin-bottom: 10px;
                        }}
                        .pro-features {{
                            background: #f8f9fa;
                            border-radius: 15px;
                            padding: 25px;
                            margin: 25px 0;
                        }}
                        .pro-features h3 {{
                            color: #333;
                            font-size: 18px;
                            margin-bottom: 15px;
                            text-align: center;
                        }}
                        .feature-list {{
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
                            color: {'#4CAF50' if action == 'approve' else '#666'};
                        }}
                        .feature-text {{
                            font-size: 14px;
                            color: #333;
                            font-weight: 500;
                        }}
                        .action-btn {{
                            display: inline-block;
                            background: linear-gradient(135deg, {'#4CAF50' if action == 'approve' else '#2196F3'}, {'#45a049' if action == 'approve' else '#1976D2'});
                            color: white;
                            text-decoration: none;
                            padding: 15px 30px;
                            border-radius: 50px;
                            font-weight: 600;
                            font-size: 16px;
                            box-shadow: 0 4px 15px rgba({156 if action == 'approve' else 33}, {175 if action == 'approve' else 150}, {80 if action == 'approve' else 243}, 0.3);
                            transition: all 0.3s ease;
                            margin: 20px 0;
                        }}
                        .action-btn:hover {{
                            transform: translateY(-2px);
                            box-shadow: 0 6px 20px rgba({156 if action == 'approve' else 33}, {175 if action == 'approve' else 150}, {80 if action == 'approve' else 243}, 0.4);
                        }}
                        .admin-note {{
                            background: #fff3cd;
                            border: 1px solid #ffeaa7;
                            border-radius: 10px;
                            padding: 20px;
                            margin: 20px 0;
                        }}
                        .admin-note h4 {{
                            color: #856404;
                            margin-bottom: 10px;
                            font-size: 16px;
                        }}
                        .admin-note p {{
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
                            <div class="spark-icon">{'👑' if action == 'approve' else '📋'}</div>
                            <h1>QuickSpark</h1>
                        </div>
                        <div class="content">
                            <div class="decision-icon">{'🎉' if action == 'approve' else '📝'}</div>
                            <h2>Hi {req_doc.get('name') or 'there'}!</h2>
                            <p>We've reviewed your request for Pro access and wanted to update you on the decision.</p>
                            
                            <div class="status-banner">
                                <div class="status-icon">{'✅' if action == 'approve' else '❌'}</div>
                                <div class="status-text">Request {decision.title()}</div>
                            </div>
                """,
                f"""
                            {'<p>Your account has been upgraded to Pro! You now have access to all premium features and enhanced capabilities.</p>' if action == 'approve' else '<p>After careful consideration, we\'ve decided not to approve your Pro access request at this time.</p>'}
                """,
                f"""
                            {f'''
                            <div class="pro-features">
                                <h3>Your New Pro Benefits</h3>
                                <div class="feature-list">
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
                            ''' if action == 'approve' else ''}
                """,
                f"""
                            {f'''
                            <center>
                                <a href="https://quick-spark.vercel.app/dashboard" class="action-btn">Explore Pro Features</a>
                            </center>
                            ''' if action == 'approve' else '<p>You can reply to this email with more details and re-apply if you\'d like to be reconsidered.</p>'}
                """,
                f"""
                            {f'''
                            <div class="admin-note">
                                <h4>Admin Note</h4>
                                <p>{notes}</p>
                            </div>
                            ''' if notes else ''}
                """,
                f"""
                            <p>Thank you for your interest in QuickSpark Pro. {'We\'re excited to have you as part of our premium community!' if action == 'approve' else 'We appreciate your understanding.'}</p>
                        </div>
                        <div class="footer">
                            <p><strong>QuickSpark Team</strong></p>
                            <p>{'Welcome to Pro!' if action == 'approve' else 'Continuing to serve your learning needs'}</p>
                            <p style="font-size: 12px; margin-top: 15px;">
                                Questions? <a href="mailto:quickspark.1help@gmail.com" style="color: {'#4CAF50' if action == 'approve' else '#2196F3'};">Contact Support</a>
                            </p>
                        </div>
                    </div>
                </body>
                </html>
                """
            ]

            try:
                send_email_sendgrid(requester_email, subject, "".join(html_parts))
            except Exception as mail_err:
                print(f"Failed to send requester notification email: {mail_err}")

        return jsonify({"message": f"Request {updates['status']}."}), 200

    except Exception as e:
        print(f"Error resolving pro request: {e}")
        return jsonify({"message": f"Server error: {str(e)}"}), 500




