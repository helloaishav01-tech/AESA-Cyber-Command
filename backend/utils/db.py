"""
MongoDB connection and index setup.
The login_attempts index here is what makes real brute-force lockout
possible in auth.py - without it, that feature can't work efficiently.
"""
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME", "aesa_security")

if not MONGO_URL:
    raise ValueError("MONGO_URL is not set in backend/.env")

client = None
database = None


async def connect_db():
    global client, database
    client = AsyncIOMotorClient(MONGO_URL)
    database = client[DB_NAME]

    # Fail loudly now if Atlas rejects us, instead of silently later
    await client.admin.command("ping")

    # Prevents two accounts ever sharing an email, speeds up login lookups
    await database.users.create_index("email", unique=True)

    # Powers login lockout: lets us efficiently ask "how many failed
    # attempts for this email in the last N minutes"
    await database.login_attempts.create_index([("identifier", 1), ("timestamp", 1)])

    # Auto-deletes expired password reset tokens - nothing lingers in the DB
    await database.password_reset_tokens.create_index("expires_at", expireAfterSeconds=0)

    print(f"Connected to MongoDB: {DB_NAME}")
    return database


async def close_db():
    global client
    if client:
        client.close()
        print("MongoDB connection closed")


def get_db():
    if database is None:
        raise RuntimeError("Database not initialized - connect_db() must run first")
    return database
