"""Application configuration and environment variables."""
from typing import Optional, List, Any
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # API Keys
    gemini_api_key: Optional[str] = None
    clerk_secret_key: Optional[str] = None
    
    # Database
    database_url: str = "sqlite:///./readme_ai.db"
    
    # CORS
    cors_origins: List[str] = ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"]

    @field_validator("cors_origins", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Any) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        return v
    
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False,
        extra="ignore"
    )
    
    # GitHub
    github_api_base: str = "https://api.github.com"
    github_token: Optional[str] = None


# Create settings instance
settings = Settings()
