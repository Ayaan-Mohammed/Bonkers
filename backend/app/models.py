from sqlalchemy import Column, String, Numeric, Integer, BigInteger, Date, DateTime, Boolean, ForeignKey, func
from sqlalchemy.dialects.postgresql import JSONB
from geoalchemy2 import Geometry
from app.database import Base

class Parcel(Base):
    __tablename__ = "parcels"

    ulpin = Column(String, primary_key=True)
    geom = Column(Geometry(geometry_type="POLYGON", srid=4326), nullable=False)
    state = Column(String)
    district = Column(String)
    village = Column(String)
    survey_number = Column(String)
    area_sqm = Column(Numeric)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now())


class RorRecord(Base):
    __tablename__ = "ror_records"

    id = Column(BigInteger, primary_key=True)
    ulpin = Column(String, ForeignKey("parcels.ulpin", ondelete="CASCADE"))
    owner_name = Column(String)
    khata_number = Column(String)
    land_type = Column(String)
    source_file = Column(String)
    recorded_date = Column(Date)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class RegistrationRecord(Base):
    __tablename__ = "registration_records"

    id = Column(BigInteger, primary_key=True)
    ulpin = Column(String, ForeignKey("parcels.ulpin", ondelete="CASCADE"))
    buyer_name = Column(String)
    seller_name = Column(String)
    deed_number = Column(String)
    registration_date = Column(Date)
    sale_value = Column(Numeric)
    source_file = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class TaxRecord(Base):
    __tablename__ = "tax_records"

    id = Column(BigInteger, primary_key=True)
    ulpin = Column(String, ForeignKey("parcels.ulpin", ondelete="CASCADE"))
    assessee_name = Column(String)
    tax_year = Column(Integer)
    amount_due = Column(Numeric)
    amount_paid = Column(Numeric)
    payment_status = Column(String)
    source_file = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class LandUseRecord(Base):
    __tablename__ = "land_use_records"

    id = Column(BigInteger, primary_key=True)
    ulpin = Column(String, ForeignKey("parcels.ulpin", ondelete="CASCADE"))
    land_use_type = Column(String)
    observed_date = Column(Date)
    source = Column(String)
    confidence = Column(Numeric)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class IntelligenceFlag(Base):
    __tablename__ = "intelligence_flags"

    id = Column(BigInteger, primary_key=True)
    ulpin = Column(String, ForeignKey("parcels.ulpin", ondelete="CASCADE"))
    flag_type = Column(String, nullable=False)
    severity = Column(String)
    details = Column(JSONB)
    detected_at = Column(DateTime(timezone=True), server_default=func.now())
    resolved = Column(Boolean, default=False)