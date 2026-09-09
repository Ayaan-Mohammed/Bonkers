from datetime import date, datetime, timedelta, timezone
from typing import Dict, List, Tuple
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.geo import Parcel
from app.models.rights import Encumbrance, Mutation
from app.models.intelligence import DisputeRiskScore
from app.schemas.intelligence import DisputeIntelligenceResponse, DisputeRiskFactors


def calculate_dispute_risk(db: Session, parcel: Parcel) -> DisputeIntelligenceResponse:
    """
    Calculate explainable Trust / Dispute-Risk score for a land parcel.
    Base score: 100. Deductions are applied transparently based on statutory risk indicators.
    """
    # 1. Area Variance Calculation
    area_variance_pct = 0.0
    if parcel.area_recorded_sqm and parcel.area_gis_sqm and float(parcel.area_recorded_sqm) > 0:
        rec = float(parcel.area_recorded_sqm)
        gis = float(parcel.area_gis_sqm)
        diff = abs(gis - rec)
        area_variance_pct = round((diff / rec) * 100.0, 2)

    # 2. Active Encumbrances
    active_encumbrances = list(
        db.scalars(
            select(Encumbrance).where(
                Encumbrance.parcel_id == parcel.id,
                Encumbrance.status == "active",
            )
        )
    )
    encumbrance_active = len(active_encumbrances) > 0

    # 3. Pending Court Litigation
    pending_litigation = any(e.type == "court_case" for e in active_encumbrances)

    # 4. Mutation Frequency in last 12 months
    one_year_ago = date.today() - timedelta(days=365)
    mutations_last_year = list(
        db.scalars(
            select(Mutation).where(
                Mutation.parcel_id == parcel.id,
                Mutation.applied_date >= one_year_ago,
            )
        )
    )
    mutation_frequency_12mo = len(mutations_last_year)

    # 5. Boundary overlap flag (derived from variance or alerts)
    boundary_overlap_flag = area_variance_pct > 10.0

    # 6. Apply Transparent Deductions
    deductions: Dict[str, float] = {}
    explanations: List[str] = []

    # Deduction: Area mismatch (>5% threshold)
    if area_variance_pct > 5.0:
        deduction = min(30.0, round(area_variance_pct * 1.5, 1))
        deductions["area_variance"] = deduction
        explanations.append(
            f"Physical GIS boundary differs by {area_variance_pct}% from recorded revenue area (-{deduction} pts)"
        )

    # Deduction: Active Litigation (Highest Risk)
    if pending_litigation:
        deductions["pending_litigation"] = 40.0
        explanations.append("Active judicial litigation or court stay order registered (-40.0 pts)")
    elif encumbrance_active:
        # Non-litigation active encumbrance (e.g., mortgage)
        deductions["active_mortgage"] = 25.0
        explanations.append("Active mortgage or banking institutional lien recorded (-25.0 pts)")

    # Deduction: Rapid sequential ownership changes (>1 in 12 months)
    if mutation_frequency_12mo > 1:
        deduction = min(20.0, (mutation_frequency_12mo - 1) * 10.0)
        deductions["rapid_mutations"] = deduction
        explanations.append(
            f"{mutation_frequency_12mo} ownership transfers in past 12 months flags speculative churning (-{deduction} pts)"
        )

    if not explanations:
        explanations.append("All title records clean; no active disputes, mortgages, or boundary anomalies detected.")

    total_deductions = sum(deductions.values())
    raw_score = max(0.0, min(100.0, 100.0 - total_deductions))
    final_score = round(raw_score, 1)

    # Trust Level
    if final_score >= 80.0:
        trust_level = "HIGH"
    elif final_score >= 50.0:
        trust_level = "MEDIUM"
    else:
        trust_level = "LOW"

    factors_dict = {
        "area_variance_pct": area_variance_pct,
        "encumbrance_active": encumbrance_active,
        "mutation_frequency_12mo": mutation_frequency_12mo,
        "pending_litigation": pending_litigation,
        "boundary_overlap_flag": boundary_overlap_flag,
    }

    # Persist or update dispute risk score record
    now_utc = datetime.now(timezone.utc)
    score_record = DisputeRiskScore(
        parcel_id=parcel.id,
        score=final_score,
        factors=factors_dict,
        model_version="rules_v1",
        calculated_at=now_utc,
    )
    db.add(score_record)
    db.commit()

    return DisputeIntelligenceResponse(
        ulpin=parcel.ulpin,
        score=final_score,
        trust_level=trust_level,
        factors=DisputeRiskFactors(**factors_dict),
        deductions=deductions,
        explanations=explanations,
        model_version="rules_v1",
        calculated_at=now_utc,
    )
