import hashlib
import json
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.platform import AuditTrail

GENESIS_HASH = "0" * 64


def compute_block_hash(prev_hash: str, payload_diff: Dict[str, Any]) -> str:
    """Compute deterministic SHA-256 hash for an audit ledger block."""
    serialized_payload = json.dumps(payload_diff, sort_keys=True, default=str)
    raw_content = f"{prev_hash}:{serialized_payload}".encode("utf-8")
    return hashlib.sha256(raw_content).hexdigest()


def record_audit_event(
    db: Session,
    entity_type: str,
    entity_id: str,
    action: str,
    payload_diff: Dict[str, Any],
    actor_user_id: Optional[int] = None,
) -> AuditTrail:
    """Append a tamper-evident, cryptographically chained block to the audit ledger."""
    # Find latest block for this specific entity
    latest_block = db.scalar(
        select(AuditTrail)
        .where(
            AuditTrail.entity_type == entity_type,
            AuditTrail.entity_id == entity_id,
        )
        .order_by(AuditTrail.id.desc())
    )

    prev_hash = latest_block.curr_hash if latest_block else GENESIS_HASH
    curr_hash = compute_block_hash(prev_hash, payload_diff)

    audit_entry = AuditTrail(
        entity_type=entity_type,
        entity_id=entity_id,
        action=action.upper(),
        actor_user_id=actor_user_id,
        prev_hash=prev_hash,
        curr_hash=curr_hash,
        payload_diff=payload_diff,
        created_at=datetime.now(timezone.utc),
    )
    db.add(audit_entry)
    db.commit()
    db.refresh(audit_entry)
    return audit_entry


def verify_audit_chain(db: Session, entity_type: str, entity_id: str) -> Dict[str, Any]:
    """Verify cryptographic integrity of an entity's complete audit trail chain."""
    blocks = list(
        db.scalars(
            select(AuditTrail)
            .where(
                AuditTrail.entity_type == entity_type,
                AuditTrail.entity_id == entity_id,
            )
            .order_by(AuditTrail.id.asc())
        )
    )

    if not blocks:
        return {
            "entity_type": entity_type,
            "entity_id": entity_id,
            "total_blocks": 0,
            "is_valid": True,
            "message": "No audit ledger history recorded for this entity.",
        }

    expected_prev = GENESIS_HASH
    for idx, block in enumerate(blocks, start=1):
        if block.prev_hash != expected_prev:
            return {
                "entity_type": entity_type,
                "entity_id": entity_id,
                "total_blocks": len(blocks),
                "is_valid": False,
                "broken_at_block": idx,
                "error": f"Hash chain discrepancy at block #{idx}: prev_hash mismatch.",
            }

        recomputed_curr = compute_block_hash(block.prev_hash, block.payload_diff or {})
        if block.curr_hash != recomputed_curr:
            return {
                "entity_type": entity_type,
                "entity_id": entity_id,
                "total_blocks": len(blocks),
                "is_valid": False,
                "broken_at_block": idx,
                "error": f"Tampering detected at block #{idx}: content hash does not match signature.",
            }

        expected_prev = block.curr_hash

    return {
        "entity_type": entity_type,
        "entity_id": entity_id,
        "total_blocks": len(blocks),
        "is_valid": True,
        "message": f"Cryptographic integrity verified. All {len(blocks)} blocks intact and untampered.",
    }
