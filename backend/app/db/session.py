from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings
from app.db.base import Base

# GeoAlchemy2 SQLite fallback compatibility
import geoalchemy2.admin.dialects.common as geo_common
import geoalchemy2.admin
from sqlalchemy.ext.compiler import compiles
from geoalchemy2.types import _GISType, Geometry

_orig_select_dialect = geoalchemy2.admin.select_dialect


def _safe_select_dialect(dialect_name):
    if dialect_name == "sqlite":
        return geo_common
    return _orig_select_dialect(dialect_name)


geoalchemy2.admin.select_dialect = _safe_select_dialect


@compiles(_GISType, "sqlite")
@compiles(Geometry, "sqlite")
def compile_gis_type_sqlite(type_, compiler, **kw):
    return "BLOB"


from geoalchemy2.elements import WKTElement

if settings.DATABASE_URL.startswith("sqlite"):
    _GISType.bind_expression = lambda self, val: val
    _GISType.column_expression = lambda self, col: col

    _orig_result_processor = _GISType.result_processor

    def _sqlite_result_processor(self, dialect, coltype):
        orig = _orig_result_processor(self, dialect, coltype)
        if dialect.name == "sqlite":
            def process(value):
                if value is None:
                    return None
                if isinstance(value, str):
                    if value.startswith("SRID="):
                        srid_part, wkt_part = value.split(";", 1)
                        srid = int(srid_part.replace("SRID=", ""))
                        return WKTElement(wkt_part, srid=srid)
                    return WKTElement(value)
                return orig(value)
            return process
        return orig

    _GISType.result_processor = _sqlite_result_processor





# Set up connection pool
# Note: For SQLite in testing, check_same_thread=False is needed; for Postgres, pool_pre_ping=True is standard.
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    connect_args=connect_args,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency that provides a transactional database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
