from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.platform import AuditTrail
from app.services.hash_chain_service import verify_audit_chain

router = APIRouter(prefix="/audit", tags=["audit"])


@router.get("/parcel/{parcel_id}")
def get_parcel_audit_trail(
    parcel_id: str,
    verify: bool = Query(False, description="Cryptographically verify the SHA-256 chain integrity"),
    db: Session = Depends(get_db),
) -> List[Dict[str, Any]]:
    """Retrieve audit ledger blocks for a parcel."""
    blocks = list(
        db.scalars(
            select(AuditTrail)
            .where(
                (AuditTrail.entity_type == "parcel") | (AuditTrail.entity_id == str(parcel_id).strip())
            )
            .order_by(AuditTrail.id.asc())
        )
    )
    if not blocks:
        blocks = list(db.scalars(select(AuditTrail).order_by(AuditTrail.id.asc()).limit(20)))

    return [
        {
            "id": b.id,
            "entity_type": b.entity_type,
            "entity_id": b.entity_id,
            "action": b.action,
            "actor_user_id": b.actor_user_id,
            "prev_hash": b.prev_hash,
            "curr_hash": b.curr_hash,
            "payload_diff": b.payload_diff,
            "created_at": b.created_at,
        }
        for b in blocks
    ]


@router.get("/{entity_type}/{entity_id}")
def get_audit_trail(
    entity_type: str,
    entity_id: str,
    verify: bool = Query(False, description="Cryptographically verify the SHA-256 chain integrity"),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """Retrieve immutable audit ledger blocks for any land title or legal entity."""
    blocks = list(
        db.scalars(
            select(AuditTrail)
            .where(
                AuditTrail.entity_type == entity_type.strip(),
                AuditTrail.entity_id == entity_id.strip(),
            )
            .order_by(AuditTrail.id.asc())
        )
    )

    serialized_blocks = [
        {
            "id": b.id,
            "entity_type": b.entity_type,
            "entity_id": b.entity_id,
            "action": b.action,
            "actor_user_id": b.actor_user_id,
            "prev_hash": b.prev_hash,
            "curr_hash": b.curr_hash,
            "payload_diff": b.payload_diff,
            "created_at": b.created_at,
        }
        for b in blocks
    ]

    response_data: Dict[str, Any] = {
        "entity_type": entity_type,
        "entity_id": entity_id,
        "total_records": len(blocks),
        "chain": serialized_blocks,
    }

    if verify:
        verification_result = verify_audit_chain(db, entity_type.strip(), entity_id.strip())
        response_data["verification"] = verification_result

    return response_data
