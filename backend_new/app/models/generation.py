"""README generation model for database."""
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.database import Base


class Generation(Base):
    """Generation model storing AI-generated README content."""
    
    __tablename__ = "readme_generations"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    repo_id = Column(String, ForeignKey("repositories.id", ondelete="CASCADE"), nullable=False)
    template_type = Column(String, default="professional")  # minimalist/professional/portfolio
    content = Column(Text, nullable=True)  # Generated Markdown
    status = Column(String, default="pending")  # pending/completed/failed
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    repository = relationship("Repository", back_populates="generations")
