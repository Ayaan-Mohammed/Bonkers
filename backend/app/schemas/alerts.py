from datetime import datetime
from typing import Optional, Union
from pydantic import BaseModel, ConfigDict, Field


class AlertResponse(BaseModel):
    id: int
    parcel_id: int
    ulpin: str
    alert_type: str
    confidence_score: float
    source: str
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AlertStatusUpdate(BaseModel):
    status: str = Field(pattern="^(unresolved|investigating|dismissed|resolved)$")


class GrievanceCreate(BaseModel):
    ulpin: Optional[str] = None
    parcel_id: Optional[Union[int, str]] = None
    category: str = Field(min_length=3, max_length=150)
    description: str = Field(min_length=5)
    complainant_name: Optional[str] = None
    contact_phone: Optional[str] = None


class GrievanceStatusUpdate(BaseModel):
    status: str = Field(pattern="^(submitted|under_review|hearing_scheduled|resolved|rejected)$")
    resolution_notes: Optional[str] = None
    assigned_officer_id: Optional[int] = None


class GrievanceResponse(BaseModel):
    id: int
    parcel_id: int
    ulpin: str
    citizen_user_id: int
    citizen_name: str
    assigned_officer_id: Optional[int] = None
    category: str
    description: str
    status: str
    resolution_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
