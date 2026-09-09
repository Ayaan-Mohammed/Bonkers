from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class ApiKeyCreateRequest(BaseModel):
    name: str = Field(min_length=3, max_length=100, description="Developer or application name")
    rate_limit_per_minute: Optional[int] = Field(default=60, ge=1, le=1000)


class ApiKeyCreateResponse(BaseModel):
    id: int
    name: str
    raw_api_key: str  # Shown only once upon creation
    rate_limit_per_minute: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PublicParcelResponse(BaseModel):
    ulpin: str
    survey_number: Optional[str] = None
    khasra_number: Optional[str] = None
    land_use_type: Optional[str] = None
    area_sqm: Optional[float] = None
    state: Optional[str] = None
    district: Optional[str] = None
    village: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
