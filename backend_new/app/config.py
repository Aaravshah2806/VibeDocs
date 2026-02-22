"""Application configuration and environment variables."""
import json
from typing import Optional, List, Any, Union
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
    cors_origins: Union[str, List[str]] = ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"]

    @field_validator("cors_origins", mode="after")
    @classmethod
    def finalize_cors_origins(cls, v: Any) -> List[str]:
        if isinstance(v, list):
            return v
        if isinstance(v, str):
            # Try JSON
            try:
                parsed = json.loads(v)
                if isinstance(parsed, list):
                    return parsed
            except:
                pass
            # Comma separated
            origins = [o.strip() for o in v.split(",") if o.strip()]
            return [o if o.startswith(("http://", "https://")) else f"https://{o}" for o in origins]
        return ["*"] # Fallback
    
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
