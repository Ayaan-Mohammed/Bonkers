from datetime import date, datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class GeoJSONGeometry(BaseModel):
    type: str = "Polygon"
    coordinates: List[Any]


class ParcelSummary(BaseModel):
    id: int
    ulpin: str
    survey_number: Optional[str] = None
    khasra_number: Optional[str] = None
    gata_number: Optional[str] = None
    patta_number: Optional[str] = None
    area_recorded_sqm: Optional[float] = None
    area_gis_sqm: Optional[float] = None
    land_use_type: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    village: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class ParcelDetail(ParcelSummary):
    geometry: Optional[Dict[str, Any]] = None
    source: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class RoRItem(BaseModel):
    id: int
    owner_name: str
    ownership_type: str
    share_percentage: float
    tenure_type: str
    khatauni_number: Optional[str] = None
    source_document_ref: Optional[str] = None
    valid_from: date
    valid_to: Optional[date] = None
    status: str

    model_config = ConfigDict(from_attributes=True)


class RegistrationItem(BaseModel):
    id: int
    deed_type: str
    deed_number: str
    registration_date: date
    sub_registrar_office: Optional[str] = None
    consideration_amount: Optional[float] = None
    ngdrs_ref_id: Optional[str] = None
    document_hash: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class EncumbranceItem(BaseModel):
    id: int
    type: str
    holder_name: str
    amount: Optional[float] = None
    start_date: date
    end_date: Optional[date] = None
    status: str

    model_config = ConfigDict(from_attributes=True)


class MutationItem(BaseModel):
    id: int
    mutation_type: str
    previous_owner: Optional[str] = None
    new_owner: Optional[str] = None
    applied_date: date
    approved_date: Optional[date] = None
    status: str
    remarks: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class BuildingPermissionItem(BaseModel):
    id: int
    application_number: str
    approved_use: Optional[str] = None
    built_up_area_sqm: Optional[float] = None
    floors_approved: int
    sanction_date: date
    status: str
    plan_document_ref: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class PropertyTaxItem(BaseModel):
    id: int
    assessment_year: int
    assessed_value: Optional[float] = None
    tax_amount: float
    paid_status: str
    ulb_id: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class ParcelHistoryItem(BaseModel):
    date: date
    type: str  # Registration, Mutation, Alert, BuildingPermission
    title: str
    description: str
    reference_id: Optional[str] = None
    status: str


class ZoningCheckResponse(BaseModel):
    ulpin: str
    is_within_zone: bool
    zone_type: Optional[str] = None
    permissible_far: Optional[float] = None
    permissible_use: Optional[str] = None
    message: str
