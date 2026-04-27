import os
from dotenv import load_dotenv
from passlib.context import CryptContext
import bcrypt

load_dotenv()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Method used in seed_data.py
hashed_bcrypt = bcrypt.hashpw(b"password", bcrypt.gensalt()).decode()
print(f"Bcrypt hashed: {hashed_bcrypt}")

# Method used in auth service
hashed_passlib = pwd_context.hash("password")
print(f"Passlib hashed: {hashed_passlib}")

# Verification checks
print(f"Passlib verify Bcrypt: {pwd_context.verify('password', hashed_bcrypt)}")
print(f"Passlib verify Passlib: {pwd_context.verify('password', hashed_passlib)}")
