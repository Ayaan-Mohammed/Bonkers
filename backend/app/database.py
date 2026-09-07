from collections.abc import Generator

from geoalchemy2 import Geometry
from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker


class Settings(BaseSettings):
    supabase_db_url: str
    app_env: str = "development"
    cors_origins: str = "http://localhost:5500"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
engine = create_engine(settings.supabase_db_url, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    pass


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Imported here so metadata consumers can access the spatial type from one module.
__all__ = ["Base", "Geometry", "SessionLocal", "engine", "get_db", "settings"]
