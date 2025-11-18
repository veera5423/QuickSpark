from pymongo import MongoClient
from config import Config
from supabase import create_client, Client
import psycopg2


# --- Supabase Client ---
# Initialize the Supabase client using the URL and Key
try:
    supabase: Client = create_client(Config.SUPABASE_URL, Config.SUPABASE_KEY)
    print("✅ Supabase client initialized successfully.")
except Exception as e:
    print(f"❌ Error initializing Supabase client: {e}")
    supabase = None

# --- MongoDB Client ---

client = MongoClient(Config.MONGO_URI)
db = client["QuickSpark"]  # MongoDB auto-creates this when used
resources_collection = db["resources"]  # Collection for storing resources

try:
    db.command("ping")
    print("✅ MongoDB connected successfully")
except Exception as e:
    print("❌ MongoDB connection failed:", e)


# --- Postgres Client (for Vectors) ---
try:
    if not Config.SUPABASE_DB_URL:
        print("❌ CRITICAL: SUPABASE_DB_URL is missing from config.")
        pg_conn = None
    else:
        # Connect to Postgres using the new DB URL
        pg_conn = psycopg2.connect(Config.SUPABASE_DB_URL)
        print("✅ Postgres (Vector DB) client initialized successfully.")
except Exception as e:
    print(f"❌ Error initializing Postgres client: {e}")
    pg_conn = None