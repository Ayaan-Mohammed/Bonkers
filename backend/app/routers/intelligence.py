from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Parcel
from ..schemas import IntelligenceResponse
from ..services.intelligence import find_discrepancies

router = APIRouter(prefix="/intelligence", tags=["intelligence"])


@router.get("/discrepancies", response_model=IntelligenceResponse)
def get_discrepancies(db: Session = Depends(get_db)) -> IntelligenceResponse:
    parcels = list(db.scalars(select(Parcel)))
    return IntelligenceResponse(
        total_parcels=len(parcels), discrepancies=find_discrepancies(parcels)
    )
