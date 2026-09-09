from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_current_user, get_db, require_role
from app.models.geo import Parcel
from app.models.intelligence import Grievance
from app.models.platform import User
from app.schemas.alerts import GrievanceCreate, GrievanceResponse, GrievanceStatusUpdate

router = APIRouter(prefix="/grievances", tags=["grievances"])


@router.post("", response_model=GrievanceResponse, status_code=status.HTTP_201_CREATED)
def submit_grievance(
    payload: GrievanceCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> GrievanceResponse:
    """Submit a citizen land grievance or dispute report."""
    parcel = db.scalar(select(Parcel).where(Parcel.ulpin == payload.ulpin.strip()))
    if not parcel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parcel not found")

    now = datetime.now(timezone.utc)
    grievance = Grievance(
        parcel_id=parcel.id,
        citizen_user_id=current_user.id,
        category=payload.category.strip(),
        description=payload.description.strip(),
        status="submitted",
        created_at=now,
        updated_at=now,
    )
    db.add(grievance)
    db.commit()
    db.refresh(grievance)

    return GrievanceResponse(
        id=grievance.id,
        parcel_id=parcel.id,
        ulpin=parcel.ulpin,
        citizen_user_id=current_user.id,
        citizen_name=current_user.name,
        category=grievance.category,
        description=grievance.description,
        status=grievance.status,
        resolution_notes=grievance.resolution_notes,
        created_at=grievance.created_at,
        updated_at=grievance.updated_at,
    )


@router.get("", response_model=List[GrievanceResponse])
def list_grievances(
    status_filter: Optional[str] = Query(None, alias="status"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> List[GrievanceResponse]:
    """Retrieve citizen grievances with role-based visibility."""
    stmt = select(Grievance).options(joinedload(Grievance.parcel), joinedload(Grievance.citizen))
    if current_user.role == "citizen":
        stmt = stmt.where(Grievance.citizen_user_id == current_user.id)
    elif status_filter:
        stmt = stmt.where(Grievance.status == status_filter.strip())

    stmt = stmt.order_by(Grievance.created_at.desc())
    records = list(db.scalars(stmt))
    return [
        GrievanceResponse(
            id=g.id,
            parcel_id=g.parcel_id,
            ulpin=g.parcel.ulpin if g.parcel else "N/A",
            citizen_user_id=g.citizen_user_id,
            citizen_name=g.citizen.name if g.citizen else "Citizen",
            assigned_officer_id=g.assigned_officer_id,
            category=g.category,
            description=g.description,
            status=g.status,
            resolution_notes=g.resolution_notes,
            created_at=g.created_at,
            updated_at=g.updated_at,
        )
        for g in records
    ]


@router.patch("/{grievance_id}", response_model=GrievanceResponse)
def update_grievance(
    grievance_id: int,
    payload: GrievanceStatusUpdate,
    current_user: User = Depends(require_role("admin", "revenue_officer")),
    db: Session = Depends(get_db),
) -> GrievanceResponse:
    """Update grievance resolution status and assign officer (revenue officers only)."""
    grievance = db.scalar(
        select(Grievance)
        .where(Grievance.id == grievance_id)
        .options(joinedload(Grievance.parcel), joinedload(Grievance.citizen))
    )
    if not grievance:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Grievance not found")

    grievance.status = payload.status
    if payload.resolution_notes:
        grievance.resolution_notes = payload.resolution_notes
    if payload.assigned_officer_id is not None:
        grievance.assigned_officer_id = payload.assigned_officer_id
    grievance.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(grievance)

    return GrievanceResponse(
        id=grievance.id,
        parcel_id=grievance.parcel_id,
        ulpin=grievance.parcel.ulpin if grievance.parcel else "N/A",
        citizen_user_id=grievance.citizen_user_id,
        citizen_name=grievance.citizen.name if grievance.citizen else "Citizen",
        assigned_officer_id=grievance.assigned_officer_id,
        category=grievance.category,
        description=grievance.description,
        status=grievance.status,
        resolution_notes=grievance.resolution_notes,
        created_at=grievance.created_at,
        updated_at=grievance.updated_at,
    )
