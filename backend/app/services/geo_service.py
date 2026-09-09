from typing import Any, Dict, Optional
from sqlalchemy import select, func
from sqlalchemy.orm import Session
from geoalchemy2.shape import to_shape
import shapely.geometry

from app.models.geo import Parcel, MasterPlanZone
from app.schemas.parcels import ZoningCheckResponse


def geom_to_geojson(geom) -> Optional[Dict[str, Any]]:
    """Convert a GeoAlchemy2 geometry or WKB to GeoJSON dictionary using Shapely."""
    if geom is None:
        return None
    try:
        shape = to_shape(geom)
        return shapely.geometry.mapping(shape)
    except Exception:
        # Fallback if geom is already a dict or GeoJSON-like
        if isinstance(geom, dict):
            return geom
        return None


def run_zoning_check(db: Session, parcel: Parcel) -> ZoningCheckResponse:
    """Check whether a parcel falls inside an approved Master Plan Zone."""
    # Attempt PostGIS spatial query first
    try:
        stmt = select(MasterPlanZone).where(
            func.ST_Intersects(MasterPlanZone.geom, parcel.geom)
        )
        matched_zone = db.scalar(stmt)
    except Exception:
        # Fallback for non-PostGIS dialects (e.g. SQLite tests) using Shapely
        parcel_shape = to_shape(parcel.geom) if hasattr(parcel, "geom") else None
        all_zones = list(db.scalars(select(MasterPlanZone)))
        matched_zone = None
        if parcel_shape:
            for zone in all_zones:
                try:
                    zone_shape = to_shape(zone.geom)
                    if parcel_shape.intersects(zone_shape):
                        matched_zone = zone
                        break
                except Exception:
                    continue

    if matched_zone:
        return ZoningCheckResponse(
            ulpin=parcel.ulpin,
            is_within_zone=True,
            zone_type=matched_zone.zone_type,
            permissible_far=float(matched_zone.permissible_far) if matched_zone.permissible_far else None,
            permissible_use=matched_zone.permissible_use,
            message=f"Parcel falls within approved {matched_zone.zone_type.upper()} zone.",
        )

    return ZoningCheckResponse(
        ulpin=parcel.ulpin,
        is_within_zone=False,
        zone_type=None,
        permissible_far=None,
        permissible_use=None,
        message="Parcel lies outside designated Master Plan Zones (Unzoned / Agricultural Buffer).",
    )
