from sqlalchemy import (
    Column,
    Integer,
    String,
    Numeric,
    Date,
    DateTime,
    Text,
    ForeignKey,
    func,
)
from sqlalchemy.orm import relationship
from app.db.base import Base


class Owner(Base):
    __tablename__ = "owners"

    id = Column(Integer, primary_key=True, autoincrement=True)
    full_name = Column(String(255), nullable=False)
    aadhaar_hash = Column(String(64), nullable=True, index=True)
    mobile_hash = Column(String(64), nullable=True, index=True)
    father_or_spouse_name = Column(String(255), nullable=True)
    address = Column(Text, nullable=True)

    record_of_rights = relationship("RecordOfRights", back_populates="owner")
    outgoing_mutations = relationship("Mutation", foreign_keys="Mutation.previous_owner_id", back_populates="previous_owner")
    incoming_mutations = relationship("Mutation", foreign_keys="Mutation.new_owner_id", back_populates="new_owner")


class RecordOfRights(Base):
    __tablename__ = "record_of_rights"

    id = Column(Integer, primary_key=True, autoincrement=True)
    parcel_id = Column(Integer, ForeignKey("parcels.id", ondelete="RESTRICT"), nullable=False, index=True)
    owner_id = Column(Integer, ForeignKey("owners.id", ondelete="RESTRICT"), nullable=False, index=True)

    ownership_type = Column(String(50), default="sole")  # sole, joint, tenant, institutional
    share_percentage = Column(Numeric(5, 2), default=100.00)
    tenure_type = Column(String(100), default="Freehold")
    khatauni_number = Column(String(100), nullable=True, index=True)
    source_document_ref = Column(String(255), nullable=True)

    valid_from = Column(Date, nullable=False)
    valid_to = Column(Date, nullable=True)
    status = Column(String(50), default="active")  # active, historical, disputed

    parcel = relationship("Parcel", back_populates="record_of_rights")
    owner = relationship("Owner", back_populates="record_of_rights")


class Registration(Base):
    __tablename__ = "registrations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    parcel_id = Column(Integer, ForeignKey("parcels.id", ondelete="RESTRICT"), nullable=False, index=True)

    deed_type = Column(String(100), nullable=False)  # Sale Deed, Gift Deed, Partition Deed, Mortgage Deed
    deed_number = Column(String(100), nullable=False, index=True)
    registration_date = Column(Date, nullable=False)
    sub_registrar_office = Column(String(255), nullable=True)
    consideration_amount = Column(Numeric(14, 2), nullable=True)
    ngdrs_ref_id = Column(String(100), nullable=True)
    document_hash = Column(String(64), nullable=True)  # SHA-256 for tamper detection

    parcel = relationship("Parcel", back_populates="registrations")


class Encumbrance(Base):
    __tablename__ = "encumbrances"

    id = Column(Integer, primary_key=True, autoincrement=True)
    parcel_id = Column(Integer, ForeignKey("parcels.id", ondelete="RESTRICT"), nullable=False, index=True)

    type = Column(String(50), nullable=False)  # mortgage, lien, court_case, lease
    holder_name = Column(String(255), nullable=False)  # Bank, financial institution, litigant
    amount = Column(Numeric(14, 2), nullable=True)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    status = Column(String(50), default="active")  # active, closed

    parcel = relationship("Parcel", back_populates="encumbrances")


class Mutation(Base):
    __tablename__ = "mutations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    parcel_id = Column(Integer, ForeignKey("parcels.id", ondelete="RESTRICT"), nullable=False, index=True)

    mutation_type = Column(String(100), nullable=False)  # Sale, Succession, Partition, Gift
    previous_owner_id = Column(Integer, ForeignKey("owners.id", ondelete="RESTRICT"), nullable=True)
    new_owner_id = Column(Integer, ForeignKey("owners.id", ondelete="RESTRICT"), nullable=True)

    applied_date = Column(Date, nullable=False)
    approved_date = Column(Date, nullable=True)
    status = Column(String(50), default="pending")  # pending, approved, rejected
    approving_officer_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    remarks = Column(Text, nullable=True)

    parcel = relationship("Parcel", back_populates="mutations")
    previous_owner = relationship("Owner", foreign_keys=[previous_owner_id], back_populates="outgoing_mutations")
    new_owner = relationship("Owner", foreign_keys=[new_owner_id], back_populates="incoming_mutations")
