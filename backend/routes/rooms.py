from datetime import datetime, timedelta
from io import BytesIO
from uuid import uuid4

from PyPDF2 import PdfReader
from bson import ObjectId, errors
from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from werkzeug.utils import secure_filename

from config import Config
from db.mongo_client import db, rooms_collection, users_collection, supabase
from models.user import UserModel
from utils.sendgrid_helper import send_email_sendgrid

rooms_bp = Blueprint("rooms", __name__)


def _serialize(value):
    if isinstance(value, dict):
        return {key: _serialize(item) for key, item in value.items()}
    if isinstance(value, list):
        return [_serialize(item) for item in value]
    if isinstance(value, ObjectId):
        return str(value)
    if isinstance(value, datetime):
        return value.isoformat()
    return value


def _now():
    return datetime.utcnow()


def _new_id():
    return str(uuid4())


def _get_user_profile(user_id):
    user = UserModel.find_by_id(user_id)
    if not user:
        return None

    return {
        "id": str(user["_id"]),
        "username": user.get("username", "User"),
        "email": user.get("email", ""),
        "is_admin": user.get("is_admin", False),
        "is_pro_member": user.get("is_pro_member", False),
    }


def _make_room_code():
    return f"ROOM-{uuid4().hex[:8].upper()}"


def _make_share_token():
    return uuid4().hex


def _invite_link(room_id, invite_token):
    frontend = Config.FRONTEND or "http://localhost:5173"
    return f"{frontend}/dashboard/rooms/{room_id}?invite={invite_token}"


def _find_room(room_id):
    query = {"room_id": room_id}
    try:
        query = {"$or": [{"room_id": room_id}, {"_id": ObjectId(room_id)}]}
    except errors.InvalidId:
        pass

    return rooms_collection.find_one(query)


def _user_membership(room, user_id):
    members = room.get("members", [])
    user_id_str = str(user_id)
    return next((member for member in members if str(member.get("user_id")) == user_id_str), None)


def _ensure_access(room, user_id, invite_token=None):
    if not room:
        return False

    if str(room.get("owner_id")) == str(user_id):
        return True

    if _user_membership(room, user_id):
        return True

    if invite_token:
        for invite in room.get("invites", []):
            if invite.get("token") == invite_token:
                return True

    return False


def _ensure_owner(room, user_id):
    if not room:
        return False

    if str(room.get("owner_id")) == str(user_id):
        return True

    membership = _user_membership(room, user_id)
    return bool(membership and membership.get("role") in {"owner", "admin"})


def _room_response(room):
    if not room:
        return None

    return _serialize({
        "id": room.get("room_id") or str(room.get("_id")),
        **room,
    })


def _append_room_history(room_id, field_name, payload):
    rooms_collection.update_one(
        {"room_id": room_id},
        {
            "$push": {field_name: payload},
            "$set": {"updated_at": _now()},
        },
    )


def _send_invite_email(to_email, inviter_name, room, invite_link):
    subject = f"Invitation to join {room.get('name')}"
    html = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>QuickSpark Room Invite</title>
        <style>
            body {{ font-family: Arial, sans-serif; margin: 0; padding: 0; background: #0f172a; color: #0f172a; }}
            .wrap {{ max-width: 640px; margin: 0 auto; padding: 24px; }}
            .card {{ background: white; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 50px rgba(15, 23, 42, 0.25); }}
            .header {{ padding: 28px; background: linear-gradient(135deg, #0f172a, #0f766e, #14b8a6); color: white; }}
            .content {{ padding: 28px; }}
            .pill {{ display: inline-block; padding: 6px 12px; border-radius: 999px; background: #ecfeff; color: #0f766e; font-size: 12px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }}
            .btn {{ display: inline-block; margin-top: 18px; padding: 14px 22px; border-radius: 14px; background: #0f766e; color: white; text-decoration: none; font-weight: 700; }}
            .meta {{ margin-top: 16px; font-size: 14px; color: #475569; line-height: 1.6; }}
            .code {{ margin-top: 14px; padding: 14px; background: #f8fafc; border-radius: 14px; font-weight: 700; letter-spacing: .08em; }}
            .footer {{ padding: 20px 28px 28px; color: #64748b; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="wrap">
            <div class="card">
                <div class="header">
                    <div class="pill">Study room invite</div>
                    <h1 style="margin: 14px 0 0; font-size: 28px;">{room.get('name')}</h1>
                    <p style="margin: 8px 0 0; color: rgba(255,255,255,.85);">Shared by {inviter_name}</p>
                </div>
                <div class="content">
                    <p>You have been invited to join the QuickSpark study room <strong>{room.get('name')}</strong> for <strong>{room.get('subject')}</strong>.</p>
                    <a class="btn" href="{invite_link}">Join Room</a>
                    <div class="meta">Room passkey</div>
                    <div class="code">{room.get('passkey')}</div>
                    <div class="meta">Invite link</div>
                    <div class="code" style="word-break: break-all; font-weight: 600; text-transform: none; letter-spacing: normal;">{invite_link}</div>
                    <p class="meta">This invite is for collaborative study, folder sharing, resource uploads, and room chat. Video calls can be added later.</p>
                </div>
                <div class="footer">If you were not expecting this invite, you can ignore this email.</div>
            </div>
        </div>
    </body>
    </html>
    """

    send_email_sendgrid(to_email, subject, html)


@rooms_bp.route("/", methods=["GET"])
@jwt_required()
def list_rooms():
    try:
        current_user_id = get_jwt_identity()
        user_obj_id = ObjectId(current_user_id)
    except errors.InvalidId:
        return jsonify({"message": "Invalid user ID"}), 400

    query = {
        "$or": [
            {"owner_id": user_obj_id},
            {"members.user_id": user_obj_id},
        ]
    }

    rooms = list(rooms_collection.find(query).sort
    ("updated_at", -1))
#    # print resource details
#     print("Rooms found:", len(rooms))
#     for room in rooms:
#         print("Room ID:", room.get("room_id"))
#         print("Room Name:", room.get("name"))
#         print("Room Subject:", room.get("subject"))
#         print("Room Description:", room.get("description"))
#         print("Room Visibility:", room.get("visibility"))
#         print("Room Owner ID:", room.get("owner_id"))
#         print("Room Members:", room.get("members"))
#         print("Room Folders:", room.get("folders"))
#         resources = []
#         for folder in room.get("folders", []):
#             resources.extend(folder.get("resources", []))

#         print("Room Resources:", resources)


    return jsonify({"rooms": [_room_response(room) for room in rooms]}), 200


@rooms_bp.route("/", methods=["POST"])
@jwt_required()
def create_room():
    data = request.get_json() or {}
    name = (data.get("name") or "").strip()
    subject = (data.get("subject") or "").strip()
    description = (data.get("description") or "").strip()
    passkey = (data.get("passkey") or "").strip() or _make_room_code()
    visibility = (data.get("visibility") or "private").strip()

    if not name or not subject:
        return jsonify({"message": "Room name and subject are required."}), 400

    current_user_id = get_jwt_identity()
    user_obj_id = ObjectId(current_user_id)
    user = _get_user_profile(current_user_id)
    if not user:
        return jsonify({"message": "User not found."}), 404

    now = _now()
    room_doc = {
        "room_id": _new_id(),
        "name": name,
        "subject": subject,
        "description": description,
        "passkey": passkey,
        "share_token": _make_share_token(),
        "visibility": visibility if visibility in {"private", "public"} else "private",
        "owner_id": user_obj_id,
        "owner": {"user_id": user_obj_id, "name": user["username"], "email": user["email"], "role": "owner"},
        "members": [
            {"user_id": user_obj_id, "name": user["username"], "email": user["email"], "role": "owner", "status": "active", "joined_at": now}
        ],
        "folders": [],
        "chat": [
            {"message_id": _new_id(), "author_id": user_obj_id, "author": user["username"], "role": "owner", "content": "Room created. Invite your study group and start organizing folders.", "created_at": now}
        ],
        "invites": [],
        "created_at": now,
        "updated_at": now,
    }

    result = rooms_collection.insert_one(room_doc)
    created_room = rooms_collection.find_one({"_id": result.inserted_id})
    return jsonify({"message": "Room created successfully.", "room": _room_response(created_room)}), 201


@rooms_bp.route("/<room_id>", methods=["GET"])
@jwt_required()
def get_room(room_id):
    current_user_id = get_jwt_identity()
    room = _find_room(room_id)
    if not room:
        return jsonify({"message": "Room not found."}), 404

    invite_token = request.args.get("invite", "").strip()
    if not _ensure_access(room, current_user_id, invite_token):
        return jsonify({"message": "You do not have access to this room."}), 403

    return jsonify({"room": _room_response(room)}), 200


@rooms_bp.route("/<room_id>/folders", methods=["POST"])
@jwt_required()
def create_folder(room_id):
    data = request.get_json() or {}
    name = (data.get("name") or "").strip()
    description = (data.get("description") or "").strip()
    parent_folder_id = (data.get("parent_folder_id") or "").strip() or None

    if not name:
        return jsonify({"message": "Folder name is required."}), 400

    current_user_id = get_jwt_identity()
    room = _find_room(room_id)
    if not room:
        return jsonify({"message": "Room not found."}), 404

    if not _ensure_owner(room, current_user_id):
        return jsonify({"message": "Only the room owner or admins can create folders."}), 403

    folder_doc = {
        "folder_id": _new_id(),
        "name": name,
        "description": description,
        "parent_folder_id": parent_folder_id,
        "created_at": _now(),
        "updated_at": _now(),
        "resources": [],
    }

    rooms_collection.update_one(
        {"_id": room["_id"]},
        {
            "$push": {"folders": folder_doc},
            "$set": {"updated_at": _now()},
        },
    )

    return jsonify({"message": "Folder created successfully.", "folder": _serialize(folder_doc)}), 201


@rooms_bp.route("/<room_id>/resources", methods=["POST"])
@jwt_required()
def add_resource(room_id):
    folder_id = (request.form.get("folder_id") or "").strip()
    title = (request.form.get("title") or "").strip()
    kind = (request.form.get("kind") or "pdf").strip().lower()
    url = (request.form.get("url") or "").strip()
    filename = (request.form.get("fileName") or "").strip()
    notes = (request.form.get("notes") or "").strip()
    file = request.files.get("file") if "file" in request.files else None

    if not folder_id or not title:
        return jsonify({"message": "Folder and title are required."}), 400

    if kind not in {"pdf", "link"}:
        return jsonify({"message": "Resource kind must be 'pdf' or 'link'."}), 400

    if kind == "link" and not url:
        return jsonify({"message": "A URL is required for link resources."}), 400

    if kind == "pdf" and not file:
        return jsonify({"message": "A PDF file is required for PDF resources."}), 400

    current_user_id = get_jwt_identity()
    room = _find_room(room_id)
    if not room:
        return jsonify({"message": "Room not found."}), 404

    if not _ensure_access(room, current_user_id):
        return jsonify({"message": "You do not have access to this room."}), 403

    # Default values for non-PDF resources
    file_name = ""
    file_size = 0
    page_count = 0
    resource_uuid = ""
    supabase_storage_path = ""
    room_resource_url = ""

    # Handle PDF file upload
    if kind == "pdf" and file:
        file_name = secure_filename(filename or file.filename or "document.pdf")
        file_bytes = file.read()
        file_size = len(file_bytes)

        # Upload the file to Supabase storage
        resource_uuid = str(uuid4())
        supabase_storage_path = f"rooms/{resource_uuid}/{file_name}"

        supabase.storage.from_(Config.SUPABASE_BUCKET).upload(
            path=supabase_storage_path,
            file=file_bytes,
            file_options={"content-type": "application/pdf"},
        )

        room_resource_url = supabase.storage.from_(Config.SUPABASE_BUCKET).get_public_url(
            supabase_storage_path
        )

        # Extract page count from PDF
        try:
            pdf_reader_for_pages = PdfReader(BytesIO(file_bytes))
            page_count = len(pdf_reader_for_pages.pages)
        except Exception:
            page_count = 0

    resource_doc = {
        "resource_id": _new_id(),
        "title": title,
        "kind": kind,
        "url": url,
        "file_name": file_name,
        "file_size_label": "",
        "file_size_bytes": file_size,
        "page_count": page_count,
        "resource_url": room_resource_url,
        "resource_uuid": resource_uuid,
        "supabase_storage_path": supabase_storage_path,
        "notes": notes,
        "added_by": ObjectId(current_user_id),
        "added_at": _now(),
    }

    update_result = rooms_collection.update_one(
        {"_id": room["_id"], "folders.folder_id": folder_id},
        {
            "$push": {"folders.$.resources": resource_doc},
            "$set": {"updated_at": _now(), "folders.$.updated_at": _now()},
        },
    )

    if update_result.matched_count == 0:
        return jsonify({"message": "Folder not found."}), 404

    return jsonify({"message": "Resource added successfully.", "resource": _serialize(resource_doc)}), 201


@rooms_bp.route("/<room_id>/messages", methods=["POST"])
@jwt_required()
def add_message(room_id):
    data = request.get_json() or {}
    content = (data.get("content") or "").strip()

    if not content:
        return jsonify({"message": "Message content is required."}), 400

    current_user_id = get_jwt_identity()
    room = _find_room(room_id)
    if not room:
        return jsonify({"message": "Room not found."}), 404

    if not _ensure_access(room, current_user_id):
        return jsonify({"message": "You do not have access to this room."}), 403

    user = _get_user_profile(current_user_id)
    if not user:
        return jsonify({"message": "User not found."}), 404

    message_doc = {
        "message_id": _new_id(),
        "author_id": ObjectId(current_user_id),
        "author": user["username"],
        "role": "owner" if str(room.get("owner_id")) == current_user_id else "member",
        "content": content,
        "created_at": _now(),
    }

    _append_room_history(room["room_id"], "chat", message_doc)
    return jsonify({"message": "Message sent successfully.", "chat_message": _serialize(message_doc)}), 201


@rooms_bp.route("/<room_id>/invites", methods=["POST"])
@jwt_required()
def create_invites(room_id):
    data = request.get_json() or {}
    emails_input = data.get("emails") or []
    if isinstance(emails_input, str):
        emails = [email.strip() for email in emails_input.split(",") if email.strip()]
    else:
        emails = [str(email).strip() for email in emails_input if str(email).strip()]

    if not emails:
        return jsonify({"message": "At least one email address is required."}), 400

    current_user_id = get_jwt_identity()
    room = _find_room(room_id)
    if not room:
        return jsonify({"message": "Room not found."}), 404

    if not _ensure_owner(room, current_user_id):
        return jsonify({"message": "Only the room owner or admins can invite members."}), 403

    user = _get_user_profile(current_user_id)
    inviter_name = user["username"] if user else "Room Owner"

    created_invites = []
    failed_emails = []
    now = _now()

    for email in emails:
        token = _new_id()
        invite_doc = {
            "invite_id": _new_id(),
            "email": email,
            "name": email.split("@")[0],
            "token": token,
            "status": "pending",
            "created_at": now,
            "invited_by": inviter_name,
            "join_link": _invite_link(room_id, token),
        }

        try:
            room_doc = _find_room(room_id)
            _send_invite_email(email, inviter_name, room_doc, invite_doc["join_link"])
        except Exception as email_error:
            failed_emails.append({"email": email, "error": str(email_error)})

        rooms_collection.update_one(
            {"_id": room["_id"]},
            {"$push": {"invites": invite_doc}, "$set": {"updated_at": now}},
        )

        created_invites.append(invite_doc)

    return jsonify({
        "message": "Invites created successfully.",
        "invites": _serialize(created_invites),
        "failed_emails": failed_emails,
    }), 201


@rooms_bp.route("/<room_id>/join", methods=["POST"])
@jwt_required()
def join_room(room_id):
    data = request.get_json() or {}
    passkey = (data.get("passkey") or "").strip()
    invite_token = (data.get("invite_token") or "").strip()

    current_user_id = get_jwt_identity()
    room = _find_room(room_id)
    if not room:
        return jsonify({"message": "Room not found."}), 404

    user = _get_user_profile(current_user_id)
    if not user:
        return jsonify({"message": "User not found."}), 404

    existing_member = _user_membership(room, current_user_id)
    if existing_member:
        return jsonify({"message": "You are already a member of this room.", "room": _room_response(room)}), 200

    invite_match = None
    if invite_token:
        invite_match = next((invite for invite in room.get("invites", []) if invite.get("token") == invite_token), None)

    if invite_match:
        rooms_collection.update_one(
            {"_id": room["_id"], "invites.token": invite_token},
            {
                "$set": {
                    "invites.$.status": "accepted",
                    "invites.$.accepted_at": _now(),
                    "updated_at": _now(),
                },
                "$push": {
                    "members": {
                        "user_id": ObjectId(current_user_id),
                        "name": user["username"],
                        "email": user["email"],
                        "role": "member",
                        "status": "active",
                        "joined_at": _now(),
                    }
                },
            },
        )
        refreshed_room = _find_room(room_id)
        return jsonify({"message": "Room joined successfully.", "room": _room_response(refreshed_room)}), 200

    if passkey and passkey == room.get("passkey"):
        rooms_collection.update_one(
            {"_id": room["_id"]},
            {
                "$push": {
                    "members": {
                        "user_id": ObjectId(current_user_id),
                        "name": user["username"],
                        "email": user["email"],
                        "role": "member",
                        "status": "active",
                        "joined_at": _now(),
                    }
                },
                "$set": {"updated_at": _now()},
            },
        )
        refreshed_room = _find_room(room_id)
        return jsonify({"message": "Room joined successfully.", "room": _room_response(refreshed_room)}), 200

    return jsonify({"message": "Invalid passkey or invite token."}), 403
