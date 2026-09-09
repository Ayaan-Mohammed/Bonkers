from datetime import datetime, timezone
from typing import Dict, Any
from sqlalchemy.orm import Session
from app.models.geo import Parcel
from app.models.intelligence import ChangeDetectionAlert


def simulate_change_detection(db: Session, parcel: Parcel) -> ChangeDetectionAlert:
    """
    Simulate satellite/drone-based cadastral boundary shift detection.
    Note: For hackathon demonstration, this generates a simulated comparison
    flagging plausible boundary encroachment or vegetation loss.
    """
    alert = ChangeDetectionAlert(
        parcel_id=parcel.id,
        alert_type="boundary_shift",
        confidence_score=0.875,
        before_geom=parcel.geom,
        after_geom=parcel.geom,
        source="simulated_sentinel2_ndvi",
        status="unresolved",
        created_at=datetime.now(timezone.utc),
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert
