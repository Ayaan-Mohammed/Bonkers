from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class ConsentCreateRequest(BaseModel):
    ulpin: str
    purpose: str = Field(min_length=3, max_length=255, description="e.g. loan_due_diligence, title_verification")
    scope: List[str] = Field(default=["ror", "encumbrance", "tax"], description="List of scopes: ror, encumbrance, tax, mutations")


class ConsentActionRequest(BaseModel):
    action: str = Field(pattern="^(approve|revoke)$", description="'approve' or 'revoke'")
    valid_days: Optional[int] = Field(default=30, ge=1, le=365)


class ConsentResponse(BaseModel):
    id: int
    requester_user_id: int
    requester_name: str
    parcel_id: int
    ulpin: str
    purpose: str
    scope: List[str]
    status: str
    valid_until: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
