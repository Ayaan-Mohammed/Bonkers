from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Parcel
from ..schemas import ParcelCreate, ParcelResponse

router = APIRouter(prefix="/parcels", tags=["parcels"])


@router.get("", response_model=list[ParcelResponse])
def list_parcels(db: Session = Depends(get_db)) -> list[Parcel]:
    return list(db.scalars(select(Parcel).order_by(Parcel.id)))


@router.get("/{parcel_id}", response_model=ParcelResponse)
def get_parcel(parcel_id: int, db: Session = Depends(get_db)) -> Parcel:
    parcel = db.get(Parcel, parcel_id)
    if parcel is None:
        raise HTTPException(status_code=404, detail="Parcel not found")
    return parcel


@router.post("", response_model=ParcelResponse, status_code=201)
def create_parcel(payload: ParcelCreate, db: Session = Depends(get_db)) -> Parcel:
    parcel = Parcel(**payload.model_dump(exclude={"geometry"}))
    db.add(parcel)
    db.commit()
    db.refresh(parcel)
    return parcel
