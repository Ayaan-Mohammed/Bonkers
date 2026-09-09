"""
Database compatibility layer for legacy imports.
Prefer importing directly from `app.db` or `app.core.config`.
"""
from app.core.config import settings
from app.db.base import Base
from app.db.session import SessionLocal, engine, get_db

SUPABASE_DB_URL = settings.DATABASE_URL

__all__ = ["Base", "engine", "SessionLocal", "get_db", "settings", "SUPABASE_DB_URL"]