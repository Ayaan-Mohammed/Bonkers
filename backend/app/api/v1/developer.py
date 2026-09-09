import hashlib
import secrets
import time
from collections import defaultdict
from datetime import datetime, timezone
from typing import Dict, List, Tuple
from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_db
from app.models.geo import District, Parcel, State, Taluka, Village
from app.models.platform import ApiClient
from app.schemas.developer import ApiKeyCreateRequest, ApiKeyCreateResponse, PublicParcelResponse

router = APIRouter(tags=["developer"])

# In-memory sliding-window rate limiter: { api_key_hash: [timestamp1, timestamp2, ...] }
_rate_limit_records: Dict[str, List[float]] = defaultdict(list)


def _hash_key(key: str) -> str:
    return hashlib.sha256(key.strip().encode("utf-8")).hexdigest()


def validate_api_key(
    x_api_key: str = Header(..., description="Developer Sandbox API Key"),
    db: Session = Depends(get_db),
) -> ApiClient:
    """Validate X-API-Key header and apply sliding-window rate limiting."""
    key_hash = _hash_key(x_api_key)
    client = db.scalar(select(ApiClient).where(ApiClient.key_hash == key_hash, ApiClient.is_active.is_(True)))
    if not client:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or revoked API Key. Generate a new key at /api/v1/dev/api-keys.",
        )

    # Sliding-window rate limit check
    now = time.time()
    window_start = now - 60.0  # 1 minute window
    timestamps = [t for t in _rate_limit_records[key_hash] if t > window_start]
    if len(timestamps) >= client.rate_limit_per_minute:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Rate limit exceeded ({client.rate_limit_per_minute} requests per minute). Try again shortly.",
        )

    timestamps.append(now)
    _rate_limit_records[key_hash] = timestamps
    return client


@router.post("/dev/api-keys", response_model=ApiKeyCreateResponse, status_code=status.HTTP_201_CREATED)
def generate_api_key(
    payload: ApiKeyCreateRequest,
    db: Session = Depends(get_db),
) -> ApiKeyCreateResponse:
    """Generate a new Developer Sandbox API Key for external integrations."""
    raw_key = f"nlip_live_{secrets.token_urlsafe(32)}"
    key_hash = _hash_key(raw_key)

    api_client = ApiClient(
        name=payload.name.strip(),
        key_hash=key_hash,
        rate_limit_per_minute=payload.rate_limit_per_minute or 60,
        is_active=True,
        created_at=datetime.now(timezone.utc),
    )
    db.add(api_client)
    db.commit()
    db.refresh(api_client)

    return ApiKeyCreateResponse(
        id=api_client.id,
        name=api_client.name,
        raw_api_key=raw_key,
        rate_limit_per_minute=api_client.rate_limit_per_minute,
        created_at=api_client.created_at,
    )


@router.get("/public/parcels/{ulpin}", response_model=PublicParcelResponse)
def get_public_parcel_data(
    ulpin: str,
    api_client: ApiClient = Depends(validate_api_key),
    db: Session = Depends(get_db),
) -> PublicParcelResponse:
    """Public, sanitized parcel lookup endpoint (excludes citizen PII and sensitive legal encumbrances)."""
    stmt = (
        select(Parcel)
        .where(Parcel.ulpin == ulpin.strip())
        .options(
            joinedload(Parcel.village)
            .joinedload(Village.taluka)
            .joinedload(Taluka.district)
            .joinedload(District.state)
        )
    )
    parcel = db.scalar(stmt)
    if not parcel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parcel not found")

    state_name = parcel.village.taluka.district.state.name if parcel.village and parcel.village.taluka and parcel.village.taluka.district and parcel.village.taluka.district.state else None
    district_name = parcel.village.taluka.district.name if parcel.village and parcel.village.taluka and parcel.village.taluka.district else None
    village_name = parcel.village.name if parcel.village else None

    return PublicParcelResponse(
        ulpin=parcel.ulpin,
        survey_number=parcel.survey_number,
        khasra_number=parcel.khasra_number,
        land_use_type=parcel.land_use_type,
        area_sqm=float(parcel.area_recorded_sqm or parcel.area_gis_sqm or 0),
        state=state_name,
        district=district_name,
        village=village_name,
    )
