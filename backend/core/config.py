from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import AnyHttpUrl
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Personal OS"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # AI Engine Auth
    AI_PROVIDER: str = "google" # "google" or "azure"
    
    # Google Gemini
    GEMINI_API_KEY: str | None = None
    GEMINI_API_KEY_SECOND: str | None = None
    
    # Azure OpenAI
    AZURE_OPENAI_API_KEY: str | None = None
    AZURE_OPENAI_ENDPOINT: str | None = None
    AZURE_OPENAI_DEPLOYMENT: str | None = None
    AZURE_OPENAI_API_VERSION: str = "2023-12-01-preview"

    CLAUDE_API_KEY: str | None = None
    AI_MODEL: str = "google-gla:gemini-2.0-flash" # Default
    
    # DATABASE
    DATABASE_URL: str = "sqlite+aiosqlite:///./sql_app.db"
    
    # KNOWLEDGE BASE SETTINGS
    KB_STORAGE_PROVIDER: str = "local" # "local" or "azure"
    KB_LOCAL_PATH: str = "./data/kb_files"
    AZURE_STORAGE_CONNECTION_STRING: str | None = None
    AZURE_KB_CONTAINER: str = "knowledge-base"
    
    # COSMOS DB (For Knowledge Metadata & Vectors)
    COSMOS_ENDPOINT: str | None = None
    COSMOS_KEY: str | None = None
    COSMOS_DATABASE: str = "KairOS"
    COSMOS_CONTAINER: str = "KnowledgeBase"

    @property
    def async_database_url(self) -> str:
        """Ensures the database URL is compatible with async drivers."""
        url = self.DATABASE_URL
        if url.startswith("postgres://") or url.startswith("postgresql://"):
            url = url.replace("postgres://", "postgresql+asyncpg://", 1)
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
        elif "database.windows.net" in url and "Driver=" not in url:
            # Automatic enrichment for Azure SQL if using a standard connection string
            # SQLModel/SQLAlchemy MS SQL async needs mssql+aioodbc
            if url.startswith("mssql://"):
                url = url.replace("mssql://", "mssql+aioodbc://", 1)
            # Ensure Encrypt and TrustServerCertificate for Azure
            if "?" not in url:
                url += "?driver=ODBC+Driver+18+for+SQL+Server&Encrypt=yes&TrustServerCertificate=no"
        return url
    
    # CORS
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = []

    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env", extra="ignore")

settings = Settings()
