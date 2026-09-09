from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_, select
from sqlalchemy.orm import Session, joinedload

from app.db.session import get_db
from app.models.geo import District, Parcel, State, Taluka, Village
from app.models.rights import Encumbrance, Mutation, RecordOfRights, Registration
from app.models.planning import BuildingPermission, PropertyTaxRecord
from app.models.intelligence import ChangeDetectionAlert
from app.schemas.parcels import (
    BuildingPermissionItem,
    EncumbranceItem,
    MutationItem,
    ParcelDetail,
    ParcelHistoryItem,
    ParcelSummary,
    PropertyTaxItem,
    RegistrationItem,
    RoRItem,
    ZoningCheckResponse,
)
from app.services.geo_service import geom_to_geojson, run_zoning_check

router = APIRouter(prefix="/parcels", tags=["parcels"])


def _build_summary(parcel: Parcel) -> ParcelSummary:
    state_name = parcel.village.taluka.district.state.name if parcel.village and parcel.village.taluka and parcel.village.taluka.district and parcel.village.taluka.district.state else None
    district_name = parcel.village.taluka.district.name if parcel.village and parcel.village.taluka and parcel.village.taluka.district else None
    village_name = parcel.village.name if parcel.village else None

    return ParcelSummary(
        id=parcel.id,
        ulpin=parcel.ulpin,
        survey_number=parcel.survey_number,
        khasra_number=parcel.khasra_number,
        gata_number=parcel.gata_number,
        patta_number=parcel.patta_number,
        area_recorded_sqm=float(parcel.area_recorded_sqm) if parcel.area_recorded_sqm else None,
        area_gis_sqm=float(parcel.area_gis_sqm) if parcel.area_gis_sqm else None,
        land_use_type=parcel.land_use_type,
        state=state_name,
        district=district_name,
        village=village_name,
    )


@router.get("", response_model=List[ParcelSummary])
def search_parcels(
    q: Optional[str] = Query(None, description="Search by ULPIN, Survey Number, Khasra Number, or Patta Number"),
    state_id: Optional[int] = Query(None, description="Filter by State ID"),
    district_id: Optional[int] = Query(None, description="Filter by District ID"),
    village_id: Optional[int] = Query(None, description="Filter by Village ID"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
) -> List[ParcelSummary]:
    """Search and filter cadastral land parcels across administrative hierarchies."""
    stmt = (
        select(Parcel)
        .options(
            joinedload(Parcel.village)
            .joinedload(Village.taluka)
            .joinedload(Taluka.district)
            .joinedload(District.state)
        )
    )

    if q:
        term = f"%{q.strip()}%"
        stmt = stmt.where(
            or_(
                Parcel.ulpin.ilike(term),
                Parcel.survey_number.ilike(term),
                Parcel.khasra_number.ilike(term),
                Parcel.patta_number.ilike(term),
            )
        )

    if village_id:
        stmt = stmt.where(Parcel.village_id == village_id)

    stmt = stmt.order_by(Parcel.id).offset(offset).limit(limit)
    parcels = list(db.scalars(stmt).unique())
    return [_build_summary(p) for p in parcels]


@router.get("/{ulpin}", response_model=ParcelDetail)
def get_parcel_detail(ulpin: str, db: Session = Depends(get_db)) -> ParcelDetail:
    """Retrieve comprehensive cadastral parcel details including GeoJSON polygon boundary."""
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
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Parcel with ULPIN '{ulpin}' was not found",
        )

    summary = _build_summary(parcel)
    return ParcelDetail(
        **summary.model_dump(),
        geometry=geom_to_geojson(parcel.geom),
        source=parcel.source,
        created_at=parcel.created_at,
        updated_at=parcel.updated_at,
    )


@router.get("/{ulpin}/ror", response_model=List[RoRItem])
def get_parcel_ror(ulpin: str, db: Session = Depends(get_db)) -> List[RoRItem]:
    """Retrieve Record of Rights (RoR / Khatauni) ownership records for a parcel."""
    parcel = db.scalar(select(Parcel).where(Parcel.ulpin == ulpin.strip()))
    if not parcel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parcel not found")

    stmt = select(RecordOfRights).where(RecordOfRights.parcel_id == parcel.id).options(joinedload(RecordOfRights.owner))
    records = list(db.scalars(stmt))
    return [
        RoRItem(
            id=r.id,
            owner_name=r.owner.full_name if r.owner else "Unknown",
            ownership_type=r.ownership_type,
            share_percentage=float(r.share_percentage) if r.share_percentage else 100.0,
            tenure_type=r.tenure_type,
            khatauni_number=r.khatauni_number,
            source_document_ref=r.source_document_ref,
            valid_from=r.valid_from,
            valid_to=r.valid_to,
            status=r.status,
        )
        for r in records
    ]


@router.get("/{ulpin}/registrations", response_model=List[RegistrationItem])
def get_parcel_registrations(ulpin: str, db: Session = Depends(get_db)) -> List[RegistrationItem]:
    """Retrieve Sub-Registrar registered deed transactions for a parcel."""
    parcel = db.scalar(select(Parcel).where(Parcel.ulpin == ulpin.strip()))
    if not parcel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parcel not found")

    records = list(db.scalars(select(Registration).where(Registration.parcel_id == parcel.id).order_by(Registration.registration_date.desc())))
    return [
        RegistrationItem(
            id=r.id,
            deed_type=r.deed_type,
            deed_number=r.deed_number,
            registration_date=r.registration_date,
            sub_registrar_office=r.sub_registrar_office,
            consideration_amount=float(r.consideration_amount) if r.consideration_amount else None,
            ngdrs_ref_id=r.ngdrs_ref_id,
            document_hash=r.document_hash,
        )
        for r in records
    ]


@router.get("/{ulpin}/encumbrances", response_model=List[EncumbranceItem])
def get_parcel_encumbrances(ulpin: str, db: Session = Depends(get_db)) -> List[EncumbranceItem]:
    """Retrieve bank mortgages, judicial liens, or litigation claims on a parcel."""
    parcel = db.scalar(select(Parcel).where(Parcel.ulpin == ulpin.strip()))
    if not parcel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parcel not found")

    records = list(db.scalars(select(Encumbrance).where(Encumbrance.parcel_id == parcel.id).order_by(Encumbrance.start_date.desc())))
    return [
        EncumbranceItem(
            id=e.id,
            type=e.type,
            holder_name=e.holder_name,
            amount=float(e.amount) if e.amount else None,
            start_date=e.start_date,
            end_date=e.end_date,
            status=e.status,
        )
        for e in records
    ]


@router.get("/{ulpin}/mutations", response_model=List[MutationItem])
def get_parcel_mutations(ulpin: str, db: Session = Depends(get_db)) -> List[MutationItem]:
    """Retrieve land title mutation and transfer history for a parcel."""
    parcel = db.scalar(select(Parcel).where(Parcel.ulpin == ulpin.strip()))
    if not parcel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parcel not found")

    records = list(
        db.scalars(
            select(Mutation)
            .where(Mutation.parcel_id == parcel.id)
            .options(joinedload(Mutation.previous_owner), joinedload(Mutation.new_owner))
            .order_by(Mutation.applied_date.desc())
        )
    )
    return [
        MutationItem(
            id=m.id,
            mutation_type=m.mutation_type,
            previous_owner=m.previous_owner.full_name if m.previous_owner else "State",
            new_owner=m.new_owner.full_name if m.new_owner else "Unknown",
            applied_date=m.applied_date,
            approved_date=m.approved_date,
            status=m.status,
            remarks=m.remarks,
        )
        for m in records
    ]


@router.get("/{ulpin}/building-permissions", response_model=List[BuildingPermissionItem])
def get_parcel_building_permissions(ulpin: str, db: Session = Depends(get_db)) -> List[BuildingPermissionItem]:
    """Retrieve town planning sanctioned building plans and permissions."""
    parcel = db.scalar(select(Parcel).where(Parcel.ulpin == ulpin.strip()))
    if not parcel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parcel not found")

    records = list(db.scalars(select(BuildingPermission).where(BuildingPermission.parcel_id == parcel.id).order_by(BuildingPermission.sanction_date.desc())))
    return [
        BuildingPermissionItem(
            id=b.id,
            application_number=b.application_number,
            approved_use=b.approved_use,
            built_up_area_sqm=float(b.built_up_area_sqm) if b.built_up_area_sqm else None,
            floors_approved=b.floors_approved,
            sanction_date=b.sanction_date,
            status=b.status,
            plan_document_ref=b.plan_document_ref,
        )
        for b in records
    ]


@router.get("/{ulpin}/tax", response_model=List[PropertyTaxItem])
def get_parcel_property_tax(ulpin: str, db: Session = Depends(get_db)) -> List[PropertyTaxItem]:
    """Retrieve municipal property tax assessments and payment statuses."""
    parcel = db.scalar(select(Parcel).where(Parcel.ulpin == ulpin.strip()))
    if not parcel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parcel not found")

    records = list(db.scalars(select(PropertyTaxRecord).where(PropertyTaxRecord.parcel_id == parcel.id).order_by(PropertyTaxRecord.assessment_year.desc())))
    return [
        PropertyTaxItem(
            id=t.id,
            assessment_year=t.assessment_year,
            assessed_value=float(t.assessed_value) if t.assessed_value else None,
            tax_amount=float(t.tax_amount),
            paid_status=t.paid_status,
            ulb_id=t.ulb_id,
        )
        for t in records
    ]


@router.get("/{ulpin}/history", response_model=List[ParcelHistoryItem])
def get_parcel_combined_history(ulpin: str, db: Session = Depends(get_db)) -> List[ParcelHistoryItem]:
    """Retrieve an integrated chronological timeline merging registrations, mutations, and alerts."""
    parcel = db.scalar(select(Parcel).where(Parcel.ulpin == ulpin.strip()))
    if not parcel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parcel not found")

    timeline: List[ParcelHistoryItem] = []

    # Registrations
    registrations = db.scalars(select(Registration).where(Registration.parcel_id == parcel.id)).all()
    for reg in registrations:
        timeline.append(
            ParcelHistoryItem(
                date=reg.registration_date,
                type="Registration",
                title=f"{reg.deed_type} Registered",
                description=f"Registered at {reg.sub_registrar_office or 'Sub-Registrar Office'}. Deed #{reg.deed_number}",
                reference_id=reg.deed_number,
                status="completed",
            )
        )

    # Mutations
    mutations = db.scalars(select(Mutation).where(Mutation.parcel_id == parcel.id)).all()
    for mut in mutations:
        dt = mut.approved_date or mut.applied_date
        timeline.append(
            ParcelHistoryItem(
                date=dt,
                type="Mutation",
                title=f"Mutation: {mut.mutation_type}",
                description=f"Status: {mut.status}. Remarks: {mut.remarks or 'N/A'}",
                reference_id=f"MUT-{mut.id}",
                status=mut.status,
            )
        )

    # Alerts
    alerts = db.scalars(select(ChangeDetectionAlert).where(ChangeDetectionAlert.parcel_id == parcel.id)).all()
    for alt in alerts:
        d = alt.created_at.date() if alt.created_at else date.today()
        timeline.append(
            ParcelHistoryItem(
                date=d,
                type="Satellite Alert",
                title=f"Change Alert: {alt.alert_type}",
                description=f"Confidence: {float(alt.confidence_score)*100:.1f}%. Source: {alt.source}",
                reference_id=f"ALT-{alt.id}",
                status=alt.status,
            )
        )

    # Building Permissions
    permissions = db.scalars(select(BuildingPermission).where(BuildingPermission.parcel_id == parcel.id)).all()
    for perm in permissions:
        timeline.append(
            ParcelHistoryItem(
                date=perm.sanction_date,
                type="Building Permission",
                title=f"Sanction Plan: {perm.approved_use or 'Building'}",
                description=f"Approved area: {float(perm.built_up_area_sqm or 0):.2f} sqm across {perm.floors_approved} floor(s)",
                reference_id=perm.application_number,
                status=perm.status,
            )
        )

    # Sort descending by date
    timeline.sort(key=lambda x: x.date, reverse=True)
    return timeline


@router.post("/{ulpin}/zoning-check", response_model=ZoningCheckResponse)
def check_parcel_zoning(ulpin: str, db: Session = Depends(get_db)) -> ZoningCheckResponse:
    """Perform spatial intersection check between parcel geometry and master plan zoning."""
    parcel = db.scalar(select(Parcel).where(Parcel.ulpin == ulpin.strip()))
    if not parcel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parcel not found")

    return run_zoning_check(db, parcel)


from app.schemas.intelligence import DisputeIntelligenceResponse
from app.services.risk_scoring_service import calculate_dispute_risk


@router.get("/{ulpin}/intelligence", response_model=DisputeIntelligenceResponse)
def get_parcel_intelligence(ulpin: str, db: Session = Depends(get_db)) -> DisputeIntelligenceResponse:
    """Calculate and retrieve statutory dispute risk, title trust score, and explainable deductions."""
    parcel = db.scalar(select(Parcel).where(Parcel.ulpin == ulpin.strip()))
    if not parcel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parcel not found")

    return calculate_dispute_risk(db, parcel)

