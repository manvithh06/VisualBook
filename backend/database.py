from pymongo import MongoClient, ASCENDING
from datetime import datetime
import os

# Load .env manually (avoids dotenv dependency issues on Windows)
def _load_env():
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    if os.path.exists(env_path):
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    os.environ.setdefault(k.strip(), v.strip())

_load_env()

MONGODB_URI = os.getenv("MONGODB_URI", "")

# ── Connect ────────────────────────────────────────────────────
try:
    client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
    client.admin.command("ping")          # verify connection
    db     = client["visualbook"]
    users  = db["users"]
    # Index on uid for fast upserts
    users.create_index([("uid", ASCENDING)], unique=True)
    print("[DB] Connected to MongoDB Atlas ✅")
except Exception as e:
    print(f"[DB] MongoDB connection failed: {e}")
    client = None
    users  = None


# ── Operations ─────────────────────────────────────────────────
def save_user(data: dict) -> bool:
    if users is None:
        return False
    try:
        users.update_one(
            {"uid": data["uid"]},
            {
                "$set": {
                    "uid":          data["uid"],
                    "email":        data.get("email", ""),
                    "display_name": data.get("display_name", ""),
                    "photo_url":    data.get("photo_url", ""),
                    "provider":     data.get("provider", "email"),
                    "last_login":   datetime.utcnow(),
                },
                "$setOnInsert": {
                    "created_at": datetime.utcnow(),
                },
            },
            upsert=True,
        )
        return True
    except Exception as e:
        print(f"[DB] save_user error: {e}")
        return False


def get_all_users() -> list:
    if users is None:
        return []
    try:
        return list(users.find({}, {"_id": 0}).sort("last_login", -1))
    except Exception as e:
        print(f"[DB] get_all_users error: {e}")
        return []