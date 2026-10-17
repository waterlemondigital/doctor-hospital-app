from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
import json
from pathlib import Path

# Base backend directory
BACKEND_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    PROJECT_NAME: str = "HealthDiscover API"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # CORS settings
    CORS_ORIGINS: Union[List[str], str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            if v.startswith("[") and v.endswith("]"):
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        return ["*"]

    # PostgreSQL Configuration (Entire database: Users, Doctors, Hospitals, Relations)
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/healthdiscover_db"

    # JWT Authentication Configuration
    JWT_SECRET_KEY: str = "replace-this-with-a-secure-random-secret-key"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15  # 15 minutes access token
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7    # 7 days expiry
    AUTH_COOKIE_SECURE: bool = False      # True in production HTTPS, False for localhost
    AUTH_COOKIE_SAMESITE: str = "lax"     # 'lax' supports cross-port localhost requests seamlessly

    # Cloudflare R2 Configuration
    R2_ACCOUNT_ID: str = ""
    R2_ACCESS_KEY_ID: str = ""
    R2_SECRET_ACCESS_KEY: str = ""
    R2_BUCKET_NAME: str = "medvexa"
    R2_PUBLIC_URL: str = ""

    model_config = SettingsConfigDict(
        env_file=(
            str(BACKEND_DIR / ".env"),
            str(BACKEND_DIR.parent / ".env"),
        ),
        env_file_encoding="utf-8",
        extra="ignore",
    )

settings = Settings()
