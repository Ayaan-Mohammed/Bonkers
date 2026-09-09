import uuid
import pytest
from fastapi.testclient import TestClient

from app.main import app as fastapi_app
from app.db.session import SessionLocal
from app.services.hash_chain_service import record_audit_event, verify_audit_chain

@pytest.fixture
def client():
    return TestClient(fastapi_app)


def test_hash_chain_audit_and_verification(client):
    db = SessionLocal()
    entity_type = "test_land_record"
    entity_id = f"REC-{uuid.uuid4().hex[:8]}"

    # 1. Record block 1
    b1 = record_audit_event(
        db=db,
        entity_type=entity_type,
        entity_id=entity_id,
        action="CREATE",
        payload_diff={"field": "owner", "old": None, "new": "Suresh Kumar"},
        actor_user_id=1,
    )
    assert b1.prev_hash == "0" * 64
    assert len(b1.curr_hash) == 64

    # 2. Record block 2
    b2 = record_audit_event(
        db=db,
        entity_type=entity_type,
        entity_id=entity_id,
        action="UPDATE",
        payload_diff={"field": "status", "old": "pending", "new": "approved"},
        actor_user_id=2,
    )
    assert b2.prev_hash == b1.curr_hash

    # 3. Verify via API endpoint with ?verify=true
    api_res = client.get(f"/api/v1/audit/{entity_type}/{entity_id}?verify=true")
    assert api_res.status_code == 200
    res_data = api_res.json()
    assert res_data["total_records"] >= 2
    assert "verification" in res_data
    assert res_data["verification"]["is_valid"] is True
    assert res_data["verification"]["total_blocks"] >= 2
    db.close()
