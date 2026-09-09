from sqlalchemy import (
    Column,
    Integer,
    String,
    Numeric,
    DateTime,
    JSON,
    Text,
    ForeignKey,
    func,
)
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry
from app.db.base import Base


class DisputeRiskScore(Base):
    __tablename__ = "dispute_risk_scores"

    id = Column(Integer, primary_key=True, autoincrement=True)
    parcel_id = Column(Integer, ForeignKey("parcels.id", ondelete="CASCADE"), nullable=False, index=True)

    score = Column(Numeric(5, 2), nullable=False)  # 0 to 100
    factors = Column(JSON, nullable=False)  # area_variance_pct, encumbrance_active, mutation_frequency_12mo, etc.
    model_version = Column(String(50), default="rules_v1")
    calculated_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    parcel = relationship("Parcel", back_populates="dispute_scores")


class ChangeDetectionAlert(Base):
    __tablename__ = "change_detection_alerts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    parcel_id = Column(Integer, ForeignKey("parcels.id", ondelete="CASCADE"), nullable=False, index=True)

    alert_type = Column(String(100), default="boundary_shift")
    confidence_score = Column(Numeric(4, 3), nullable=False)  # 0.000 to 1.000
    before_geom = Column(Geometry(geometry_type="POLYGON", srid=4326), nullable=True)
    after_geom = Column(Geometry(geometry_type="POLYGON", srid=4326), nullable=True)
    source = Column(String(100), default="simulated_sentinel2")
    status = Column(String(50), default="unresolved")  # unresolved, investigating, dismissed, resolved
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    parcel = relationship("Parcel", back_populates="alerts")


class Grievance(Base):
    __tablename__ = "grievances"

    id = Column(Integer, primary_key=True, autoincrement=True)
    parcel_id = Column(Integer, ForeignKey("parcels.id", ondelete="CASCADE"), nullable=False, index=True)
    citizen_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    assigned_officer_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    category = Column(String(100), nullable=False)  # Boundary Dispute, Mutation Delay, Incorrect RoR
    description = Column(Text, nullable=False)
    status = Column(String(50), default="submitted")  # submitted, under_review, hearing_scheduled, resolved, rejected
    resolution_notes = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    parcel = relationship("Parcel")
    citizen = relationship("User", foreign_keys=[citizen_user_id], back_populates="grievances_filed")
    officer = relationship("User", foreign_keys=[assigned_officer_id], back_populates="grievances_assigned")
