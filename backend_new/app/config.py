"""Application configuration and environment variables."""
from typing import Optional, List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False,
        extra="ignore"
    )
    
    # API Keys
    gemini_api_key: Optional[str] = None
    clerk_secret_key: Optional[str] = None
    
    # Database
    database_url: str = "sqlite:///./readme_ai.db"
    
    # CORS
    cors_origins: List[str] = ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"]
    
    # GitHub
    github_api_base: str = "https://api.github.com"
    github_token: Optional[str] = None


# Create settings instance
# Note: anthropic_api_key validation will happen when AIGeneratorService is instantiated
settings = Settings()
