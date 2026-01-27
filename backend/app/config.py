from typing import Optional, List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False,
        extra="ignore"
    )

# API Keys
AI_API_KEY: Optional[str] = None
clerk_secret_key: Optional[str] = None

# Database
database_url: str = "sqlite:///./readme_ai.db"

# CORS
    cors_origins: List[str] = ["http://localhost:5173", "http://localhost:3000"]
    
    # GitHub
    github_api_base: str = "https://api.github.com"


# Create settings instance
# Note: anthropic_api_key validation will happen when AIGeneratorService is instantiated
settings = Settings()