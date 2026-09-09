from sqlalchemy import (
    Column,
    Integer,
    String,
    Numeric,
    Date,
    ForeignKey,
)
from sqlalchemy.orm import relationship
from app.db.base import Base


class BuildingPermission(Base):
    __tablename__ = "building_permissions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    parcel_id = Column(Integer, ForeignKey("parcels.id", ondelete="RESTRICT"), nullable=False, index=True)

    application_number = Column(String(100), nullable=False, index=True)
    approved_use = Column(String(100), nullable=True)  # Residential, Commercial, Mixed
    built_up_area_sqm = Column(Numeric(10, 2), nullable=True)
    floors_approved = Column(Integer, default=1)
    sanction_date = Column(Date, nullable=False)
    status = Column(String(50), default="approved")  # applied, approved, rejected, deviation_flagged
    plan_document_ref = Column(String(255), nullable=True)

    parcel = relationship("Parcel", back_populates="building_permissions")


class PropertyTaxRecord(Base):
    __tablename__ = "property_tax_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    parcel_id = Column(Integer, ForeignKey("parcels.id", ondelete="RESTRICT"), nullable=False, index=True)

    assessment_year = Column(Integer, nullable=False)
    assessed_value = Column(Numeric(14, 2), nullable=True)
    tax_amount = Column(Numeric(12, 2), nullable=False)
    paid_status = Column(String(50), default="paid")  # paid, due, overdue
    ulb_id = Column(String(100), nullable=True)  # Urban Local Body identifier

    parcel = relationship("Parcel", back_populates="tax_records")
