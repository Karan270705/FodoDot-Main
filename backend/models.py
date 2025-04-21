from typing import Optional
from beanie import Document, Indexed
from pydantic import EmailStr, Field
from datetime import datetime

class User(Document):
    email: Indexed(EmailStr, unique=True, collation={"locale": "en", "strength": 2}) = Field(..., nullable=False)
    name: str
    hashed_password: str
    is_active: bool = True
    address: Optional[str] = None
    created_at: datetime = datetime.utcnow()

    class Settings:
        name = "user_data"
        database = "services_db"

class LoginHistory(Document):
    user_id: str
    login_time: datetime = datetime.utcnow()
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    status: str  # "success" or "failed"
    failure_reason: Optional[str] = None

    class Settings:
        name = "user_data"
        database = "services_db"

class ChatMessage(Document):
    sender_id: str
    receiver_id: str
    message: str
    timestamp: datetime = datetime.utcnow()
    is_read: bool = False
    message_type: str = "text"  # "text", "image", "file", etc.

    class Settings:
        name = "user_chat_history"
        database = "services_db" 