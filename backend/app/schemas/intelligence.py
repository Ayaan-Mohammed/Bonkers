from datetime import datetime
from typing import Dict, List, Optional
from pydantic import BaseModel, ConfigDict


class DisputeRiskFactors(BaseModel):
    area_variance_pct: float
    encumbrance_active: bool
    mutation_frequency_12mo: int
    pending_litigation: bool
    boundary_overlap_flag: bool


class DisputeIntelligenceResponse(BaseModel):
    ulpin: str
    score: float
    trust_level: str  # HIGH, MEDIUM, LOW
    factors: DisputeRiskFactors
    deductions: Dict[str, float]
    explanations: List[str]
    model_version: str
    calculated_at: datetime

    model_config = ConfigDict(from_attributes=True)
