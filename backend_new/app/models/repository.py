"""Repository model for database."""
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.database import Base


class Repository(Base):
    """Repository model storing GitHub repository metadata."""
    
    __tablename__ = "repositories"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    github_repo_id = Column(Integer, nullable=False)
    full_name = Column(String, nullable=False)  # owner/repo format
    default_branch = Column(String, default="main")
    last_synced_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    generations = relationship("Generation", back_populates="repository", cascade="all, delete-orphan")
