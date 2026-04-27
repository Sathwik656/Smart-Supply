import asyncio
import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext

load_dotenv()

MONGO_URL = os.getenv("MONGODB_URL")
DB_NAME = os.getenv("MONGODB_DB_NAME")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def fix_admin():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    new_hashed = pwd_context.hash("password")
    
    result = await db.users.update_one(
        {"username": "admin"},
        {"$set": {"hashed_password": new_hashed}}
    )
    
    if result.matched_count > 0:
        print("✅ Admin password updated using passlib hash.")
    else:
        print("❌ Admin user not found.")

if __name__ == "__main__":
    asyncio.run(fix_admin())
