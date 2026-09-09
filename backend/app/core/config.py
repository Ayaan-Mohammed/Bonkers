import os
from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    PROJECT_NAME: str = "Parcel Intelligence API"
    VERSION: str = "0.1.0"
    API_V1_PREFIX: str = "/api/v1"
    APP_ENV: str = "development"

    # Database connection string (Supabase / Postgres)
    DATABASE_URL: str = "sqlite:///./test.db"

    @field_validator("DATABASE_URL", mode="after")
    @classmethod
    def resolve_sqlite_path(cls, v: str) -> str:
        if v.startswith("sqlite:///") and not v.startswith("sqlite:////"):
            rel_path = v.replace("sqlite:///", "").lstrip("./").lstrip(".\\")
            if not os.path.isabs(rel_path):
                backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
                candidate = os.path.join(backend_dir, rel_path)
                if os.path.exists(candidate) and os.path.getsize(candidate) > 0:
                    return f"sqlite:///{candidate.replace(os.sep, '/')}"
        return v


    # JWT Authentication
    JWT_SECRET: str = "dev_secret_key_change_in_production_min_32_chars_long"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # CORS configuration
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000"

    @property
    def cors_origin_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


settings = Settings()
