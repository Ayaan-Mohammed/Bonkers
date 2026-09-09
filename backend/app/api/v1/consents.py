from datetime import datetime, timedelta, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_, select
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_current_user, get_db
from app.models.geo import Parcel
from app.models.platform import Consent, User
from app.schemas.consents import ConsentActionRequest, ConsentCreateRequest, ConsentResponse

router = APIRouter(prefix="/consents", tags=["consents"])


@router.post("", response_model=ConsentResponse, status_code=status.HTTP_201_CREATED)
def request_consent(
    payload: ConsentCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ConsentResponse:
    """Submit a DPI Consent request to inspect sensitive parcel records."""
    parcel = db.scalar(select(Parcel).where(Parcel.ulpin == payload.ulpin.strip()))
    if not parcel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parcel not found")

    consent = Consent(
        requester_user_id=current_user.id,
        parcel_id=parcel.id,
        purpose=payload.purpose.strip(),
        scope=payload.scope,
        status="pending",
        created_at=datetime.now(timezone.utc),
    )
    db.add(consent)
    db.commit()
    db.refresh(consent)

    return ConsentResponse(
        id=consent.id,
        requester_user_id=current_user.id,
        requester_name=current_user.name,
        parcel_id=parcel.id,
        ulpin=parcel.ulpin,
        purpose=consent.purpose,
        scope=consent.scope,
        status=consent.status,
        valid_until=consent.valid_until,
        created_at=consent.created_at,
    )


@router.patch("/{consent_id}", response_model=ConsentResponse)
def handle_consent_action(
    consent_id: int,
    payload: ConsentActionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ConsentResponse:
    """Approve or revoke a pending/active consent grant."""
    consent = db.scalar(
        select(Consent)
        .where(Consent.id == consent_id)
        .options(joinedload(Consent.parcel), joinedload(Consent.requester_user))
    )
    if not consent:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Consent request not found")

    now = datetime.now(timezone.utc)
    if payload.action == "approve":
        consent.status = "approved"
        consent.valid_until = now + timedelta(days=payload.valid_days or 30)
    elif payload.action == "revoke":
        consent.status = "revoked"

    db.commit()
    db.refresh(consent)

    return ConsentResponse(
        id=consent.id,
        requester_user_id=consent.requester_user_id,
        requester_name=consent.requester_user.name if consent.requester_user else "User",
        parcel_id=consent.parcel_id,
        ulpin=consent.parcel.ulpin,
        purpose=consent.purpose,
        scope=consent.scope,
        status=consent.status,
        valid_until=consent.valid_until,
        created_at=consent.created_at,
    )


@router.get("/mine", response_model=List[ConsentResponse])
def get_my_consents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> List[ConsentResponse]:
    """List incoming and outgoing consent grants relevant to the current user."""
    stmt = (
        select(Consent)
        .where(
            or_(
                Consent.requester_user_id == current_user.id,
                # In production: matched via parcel ownership
                Consent.id.isnot(None),
            )
        )
        .options(joinedload(Consent.parcel), joinedload(Consent.requester_user))
        .order_by(Consent.created_at.desc())
    )

    consents = list(db.scalars(stmt).unique())
    return [
        ConsentResponse(
            id=c.id,
            requester_user_id=c.requester_user_id,
            requester_name=c.requester_user.name if c.requester_user else "User",
            parcel_id=c.parcel_id,
            ulpin=c.parcel.ulpin if c.parcel else "N/A",
            purpose=c.purpose,
            scope=c.scope,
            status=c.status,
            valid_until=c.valid_until,
            created_at=c.created_at,
        )
        for c in consents
    ]


def require_consent(scope: str):
    """
    FastAPI dependency factory enforcing valid, non-expired citizen consent
    before allowing access to sensitive dossier layers (e.g. for bank officials).
    """
    def consent_checker(
        ulpin: str,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db),
    ) -> bool:
        # Administrative or officer roles bypass the consent check
        if current_user.role in {"admin", "revenue_officer", "registration_officer"}:
            return True

        parcel = db.scalar(select(Parcel).where(Parcel.ulpin == ulpin.strip()))
        if not parcel:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parcel not found")

        now = datetime.now(timezone.utc)
        active_consent = db.scalar(
            select(Consent).where(
                Consent.parcel_id == parcel.id,
                Consent.requester_user_id == current_user.id,
                Consent.status == "approved",
                Consent.valid_until > now,
            )
        )

        if not active_consent or scope not in active_consent.scope:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: Valid, non-expired citizen consent required for scope '{scope}' on parcel {ulpin}.",
            )
        return True

    return consent_checker
