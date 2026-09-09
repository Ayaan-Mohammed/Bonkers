from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_current_user, get_db, require_role
from app.models.intelligence import ChangeDetectionAlert
from app.models.platform import User
from app.schemas.alerts import AlertResponse, AlertStatusUpdate

router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.get("", response_model=List[AlertResponse])
def list_alerts(
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db),
) -> List[AlertResponse]:
    """List cadastral boundary shift and land use change alerts."""
    stmt = select(ChangeDetectionAlert).options(joinedload(ChangeDetectionAlert.parcel))
    if status_filter:
        stmt = stmt.where(ChangeDetectionAlert.status == status_filter.strip())
    
    stmt = stmt.order_by(ChangeDetectionAlert.created_at.desc())
    alerts = list(db.scalars(stmt))
    return [
        AlertResponse(
            id=a.id,
            parcel_id=a.parcel_id,
            ulpin=a.parcel.ulpin if a.parcel else "N/A",
            alert_type=a.alert_type,
            confidence_score=float(a.confidence_score),
            source=a.source,
            status=a.status,
            created_at=a.created_at,
        )
        for a in alerts
    ]


@router.patch("/{alert_id}", response_model=AlertResponse)
def update_alert_status(
    alert_id: int,
    payload: AlertStatusUpdate,
    current_user: User = Depends(require_role("admin", "revenue_officer", "planning_officer")),
    db: Session = Depends(get_db),
) -> AlertResponse:
    """Update change detection alert status (restricted to officers/administrators)."""
    alert = db.scalar(
        select(ChangeDetectionAlert)
        .where(ChangeDetectionAlert.id == alert_id)
        .options(joinedload(ChangeDetectionAlert.parcel))
    )
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found")

    alert.status = payload.status
    db.commit()
    db.refresh(alert)

    return AlertResponse(
        id=alert.id,
        parcel_id=alert.parcel_id,
        ulpin=alert.parcel.ulpin if alert.parcel else "N/A",
        alert_type=alert.alert_type,
        confidence_score=float(alert.confidence_score),
        source=alert.source,
        status=alert.status,
        created_at=alert.created_at,
    )
