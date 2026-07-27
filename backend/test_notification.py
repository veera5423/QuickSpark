"""
Test script to send a feature update notification about Study Rooms to all users.

Run this script standalone from the backend directory:
    cd backend && python test_notification.py

Make sure your .env file has BREVO_API_KEY and BREVO_SENDER configured.
"""

import os
import sys
from dotenv import load_dotenv

# Load .env from the backend directory
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

# Add backend directory to path so imports work
sys.path.insert(0, os.path.dirname(__file__))

from services.notification_service import (
    send_notification_to_all_users,
    build_feature_update_html
)

# ============================================================
# CONFIGURATION — Edit these values before running
# ============================================================

FEATURE_NAME = "Study Rooms"
FEATURE_DESCRIPTION = (
    "We are excited to introduce Study Rooms — a collaborative workspace "
    "where you can create private study spaces, organize resources into folders, "
    "share invite links with classmates, and keep all your notes and discussions "
    "in one place."
)
FEATURE_BENEFITS = [
    "Create private study rooms by subject or exam",
    "Organize resources with custom folders",
    "Share invite links with classmates",
    "Real-time collaboration and chat",
    "Track progress across all your rooms"
]
CTA_TEXT = "Create Your First Study Room"
CTA_LINK = "https://quick-spark.vercel.app/dashboard/rooms"  # Update this to match your frontend URL

SEND_TO_VERIFIED_ONLY = True  # Set to False to send to ALL users (including unverified)

# ============================================================
# BUILD AND SEND
# ============================================================

def main():
    print("=" * 60)
    print(f"📢 Sending feature update: {FEATURE_NAME}")
    print("=" * 60)

    # 1. Build the HTML email content
    print("\n🔨 Building email template...")
    html_content = build_feature_update_html(
        feature_name=FEATURE_NAME,
        description=FEATURE_DESCRIPTION,
        benefits=FEATURE_BENEFITS,
        cta_text=CTA_TEXT,
        cta_link=CTA_LINK
    )
    print("✅ Email template built successfully")
    print(f"\n📧 Email preview (first 200 chars):")
    print("-" * 40)
    print(html_content[:200] + "...")
    print("-" * 40)

    # 2. Send the notification
    print(f"\n📨 Sending notification to {'verified users' if SEND_TO_VERIFIED_ONLY else 'all users'}...")
    
    try:
        result = send_notification_to_all_users(
            subject=f"🚀 New Feature: {FEATURE_NAME} is now available on QuickSpark!",
            html_content=html_content,
            only_verified=SEND_TO_VERIFIED_ONLY
        )
        
        print("\n" + "=" * 60)
        print("✅ RESULT:")
        print(f"   Total users found: {result['total_users']}")
        print(f"   Emails sent:       {result['sent']}")
        print(f"   Failed:            {result['failed']}")
        
        if result['errors']:
            print("\n❌ ERRORS:")
            for err in result['errors'][:5]:  # Show first 5 errors
                print(f"   - {err['email']}: {err['error']}")
        
        print(f"\n📋 Message: {result['message']}")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ Failed to send notification: {e}")
        sys.exit(1)


if __name__ == "__main__":
    # Quick check for required env vars
    from config import Config
    if not Config.BREVO_API_KEY:
        print("❌ BREVO_API_KEY is not set in your .env file.")
        print("   Please add it to backend/.env")
        sys.exit(1)
    if not Config.BREVO_SENDER:
        print("❌ BREVO_SENDER is not set in your .env file.")
        print("   Please add it to backend/.env")
        sys.exit(1)
    
    print("✅ Environment variables found. Proceeding...\n")
    main()
