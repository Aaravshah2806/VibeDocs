"""Application configuration and environment variables."""
import json
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
    
    # CORS - Use Any to prevent Pydantic from trying to parse it as a list before we can
    cors_origins: Any = ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"]

    @field_validator("cors_origins", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Any) -> List[str]:
        # If it's already a list, we're good
        if isinstance(v, list):
            return v
        
        # If it's a string (from environment variable)
        if isinstance(v, str):
            # 1. Try to parse as JSON list
            try:
                parsed = json.loads(v)
                if isinstance(parsed, list):
                    return parsed
            except:
                pass
            
            # 2. Try as comma-separated string
            if v.strip():
                # Split by comma and clean
                origins = [i.strip() for i in v.split(",") if i.strip()]
                # Add https:// if missing
                return [o if o.startswith(("http://", "https://")) else f"https://{o}" for o in origins]
        
        # Default fallback
        return ["http://localhost:5173"]

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False,
        extra="ignore"
    )
    
    # GitHub
    github_api_base: str = "https://api.github.com"
    github_token: Optional[str] = None


# Create settings instance
# This is where the crash happens if validation fails
settings = Settings()
