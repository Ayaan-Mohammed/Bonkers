from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime,
    JSON,
    ForeignKey,
    func,
)
from sqlalchemy.orm import relationship
from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    mobile = Column(String(20), nullable=True)
    password_hash = Column(String(255), nullable=False)
    
    # role enum: 'citizen', 'revenue_officer', 'registration_officer', 'planning_officer', 'bank_official', 'developer', 'admin'
    role = Column(String(50), default="citizen", nullable=False)
    state_id = Column(Integer, ForeignKey("states.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    consents_requested = relationship("Consent", back_populates="requester_user")
    grievances_filed = relationship("Grievance", foreign_keys="Grievance.citizen_user_id", back_populates="citizen")
    grievances_assigned = relationship("Grievance", foreign_keys="Grievance.assigned_officer_id", back_populates="officer")


class Consent(Base):
    __tablename__ = "consents"

    id = Column(Integer, primary_key=True, autoincrement=True)
    requester_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    parcel_id = Column(Integer, ForeignKey("parcels.id", ondelete="CASCADE"), nullable=False, index=True)

    purpose = Column(String(255), nullable=False)  # e.g., 'loan_due_diligence'
    scope = Column(JSON, nullable=False)  # e.g., ["ror", "encumbrance", "tax"]
    status = Column(String(50), default="pending", nullable=False)  # pending, approved, revoked, expired
    granted_by_owner_id = Column(Integer, ForeignKey("owners.id", ondelete="SET NULL"), nullable=True)
    valid_until = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    requester_user = relationship("User", back_populates="consents_requested")
    parcel = relationship("Parcel")
    granted_by_owner = relationship("Owner")


class AuditTrail(Base):
    __tablename__ = "audit_trail"

    id = Column(Integer, primary_key=True, autoincrement=True)
    entity_type = Column(String(100), nullable=False, index=True)  # record_of_rights, registrations, mutations, encumbrances
    entity_id = Column(String(100), nullable=False, index=True)
    action = Column(String(50), nullable=False)  # CREATE, UPDATE, DELETE, VERIFY
    actor_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    prev_hash = Column(String(64), nullable=False)  # SHA-256
    curr_hash = Column(String(64), nullable=False)  # SHA-256
    payload_diff = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    actor = relationship("User")


class ApiClient(Base):
    __tablename__ = "api_clients"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    key_hash = Column(String(64), unique=True, nullable=False, index=True)
    rate_limit_per_minute = Column(Integer, default=60)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
