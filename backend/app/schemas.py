from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ParcelBase(BaseModel):
    external_id: str = Field(min_length=1, max_length=100)
    status: str = "active"
    area_sq_m: float | None = Field(default=None, gt=0)
    recorded_area_sq_m: float | None = Field(default=None, gt=0)
    geometry: dict | None = None


class ParcelCreate(ParcelBase):
    pass


class ParcelResponse(ParcelBase):
    id: int
    updated_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class Discrepancy(BaseModel):
    parcel_id: int
    external_id: str
    kind: str
    message: str
    severity: str


class IntelligenceResponse(BaseModel):
    total_parcels: int
    discrepancies: list[Discrepancy]
