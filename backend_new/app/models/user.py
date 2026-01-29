"""User model for database."""
from sqlalchemy import Column, String, DateTime, Text
from sqlalchemy.sql import func
import uuid
from app.database import Base


class User(Base):
    """User model storing Clerk user ID and GitHub OAuth token."""
    
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    clerk_user_id = Column(String, unique=True, nullable=False, index=True)
    github_username = Column(String, nullable=True)
    github_access_token = Column(Text, nullable=False)  # Encrypted in production
    created_at = Column(DateTime(timezone=True), server_default=func.now())
