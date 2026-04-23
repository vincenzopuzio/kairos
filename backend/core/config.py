from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import AnyHttpUrl
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Personal OS"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # AI Engine Auth
    GEMINI_API_KEY: str | None = None
    GEMINI_API_KEY_SECOND: str | None = None
    AI_MODEL: str = "google-gla:gemini-2.5-flash"
    
    # DATABASE
    DATABASE_URL: str = "sqlite+aiosqlite:///./sql_app.db"

    @property
    def async_database_url(self) -> str:
        """Ensures the database URL is compatible with async drivers."""
        url = self.DATABASE_URL
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+asyncpg://", 1)
        elif url.startswith("postgresql://"):
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
        return url
    
    # CORS
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = []

    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env", extra="ignore")

settings = Settings()
