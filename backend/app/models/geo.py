from sqlalchemy import (
    Column,
    Integer,
    String,
    Numeric,
    Float,
    DateTime,
    ForeignKey,
    Index,
    func,
)
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry
from app.db.base import Base


class State(Base):
    __tablename__ = "states"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    code = Column(String(10), unique=True, nullable=False, index=True)

    districts = relationship("District", back_populates="state", cascade="all, delete-orphan")


class District(Base):
    __tablename__ = "districts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    state_id = Column(Integer, ForeignKey("states.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    lgd_code = Column(String(50), nullable=True)

    state = relationship("State", back_populates="districts")
    talukas = relationship("Taluka", back_populates="district", cascade="all, delete-orphan")


class Taluka(Base):
    __tablename__ = "talukas"

    id = Column(Integer, primary_key=True, autoincrement=True)
    district_id = Column(Integer, ForeignKey("districts.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)

    district = relationship("District", back_populates="talukas")
    villages = relationship("Village", back_populates="taluka", cascade="all, delete-orphan")


class Village(Base):
    __tablename__ = "villages"

    id = Column(Integer, primary_key=True, autoincrement=True)
    taluka_id = Column(Integer, ForeignKey("talukas.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    lgd_code = Column(String(50), nullable=True)

    taluka = relationship("Taluka", back_populates="villages")
    parcels = relationship("Parcel", back_populates="village")


class Parcel(Base):
    __tablename__ = "parcels"

    id = Column(Integer, primary_key=True, autoincrement=True)
    ulpin = Column(String(14), unique=True, nullable=False, index=True)  # Bhu-Aadhaar canonical key
    village_id = Column(Integer, ForeignKey("villages.id", ondelete="RESTRICT"), nullable=True)

    survey_number = Column(String(100), nullable=True, index=True)
    khasra_number = Column(String(100), nullable=True, index=True)
    gata_number = Column(String(100), nullable=True)
    patta_number = Column(String(100), nullable=True)

    area_recorded_sqm = Column(Numeric(12, 2), nullable=True)
    area_gis_sqm = Column(Numeric(12, 2), nullable=True)
    land_use_type = Column(String(50), nullable=True)  # agricultural, residential, commercial, mixed
    
    geom = Column(Geometry(geometry_type="POLYGON", srid=4326, spatial_index=True), nullable=False)
    source = Column(String(50), default="cadastral_survey")  # 'cadastral_survey' | 'svamitva_drone' | 'seed'

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    village = relationship("Village", back_populates="parcels")
    record_of_rights = relationship("RecordOfRights", back_populates="parcel", cascade="all, delete-orphan")
    registrations = relationship("Registration", back_populates="parcel", cascade="all, delete-orphan")
    encumbrances = relationship("Encumbrance", back_populates="parcel", cascade="all, delete-orphan")
    mutations = relationship("Mutation", back_populates="parcel", cascade="all, delete-orphan")
    building_permissions = relationship("BuildingPermission", back_populates="parcel", cascade="all, delete-orphan")
    tax_records = relationship("PropertyTaxRecord", back_populates="parcel", cascade="all, delete-orphan")
    dispute_scores = relationship("DisputeRiskScore", back_populates="parcel", cascade="all, delete-orphan")
    alerts = relationship("ChangeDetectionAlert", back_populates="parcel", cascade="all, delete-orphan")


class MasterPlanZone(Base):
    __tablename__ = "master_plan_zones"

    id = Column(Integer, primary_key=True, autoincrement=True)
    state_id = Column(Integer, ForeignKey("states.id", ondelete="CASCADE"), nullable=False)
    geom = Column(Geometry(geometry_type="POLYGON", srid=4326, spatial_index=True), nullable=False)
    zone_type = Column(String(50), nullable=False)  # residential, commercial, industrial, green
    permissible_far = Column(Numeric(5, 2), nullable=True)
    permissible_use = Column(String(255), nullable=True)


class UtilityInfrastructure(Base):
    __tablename__ = "utility_infrastructure"

    id = Column(Integer, primary_key=True, autoincrement=True)
    geom = Column(Geometry(geometry_type="GEOMETRY", srid=4326), nullable=False)
    type = Column(String(50), nullable=False)  # water, sewer, power, road
    parcel_id = Column(Integer, ForeignKey("parcels.id", ondelete="SET NULL"), nullable=True)
    status = Column(String(50), default="operational")
