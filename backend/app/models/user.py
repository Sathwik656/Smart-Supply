from datetime import datetime
from pydantic import Field
from beanie import Document, Indexed

class User(Document):
    username: Indexed(str, unique=True)
    email: str
    hashed_password: str
    role: str = "viewer"  # "admin" | "operator" | "viewer"
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "users"
