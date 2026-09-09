import pytest
from fastapi.testclient import TestClient

from app.main import app as fastapi_app

@pytest.fixture
def client():
    return TestClient(fastapi_app)


def test_consent_lifecycle_flow(client):
    # 1. Login as demo citizen
    login_res = client.post("/api/v1/auth/login", json={
        "email": "aman.citizen@nlip.gov.in",
        "password": "Password123!",
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Submit consent request for a parcel
    list_res = client.get("/api/v1/parcels?limit=1")
    ulpin = list_res.json()[0]["ulpin"]

    req_res = client.post("/api/v1/consents", json={
        "ulpin": ulpin,
        "purpose": "Bank Home Loan Appraisal Verification",
        "scope": ["ror", "encumbrance", "tax"],
    }, headers=headers)
    assert req_res.status_code == 201
    consent_id = req_res.json()["id"]
    assert req_res.json()["status"] == "pending"

    # 3. Approve consent
    appr_res = client.patch(f"/api/v1/consents/{consent_id}", json={
        "action": "approve",
        "valid_days": 30,
    }, headers=headers)
    assert appr_res.status_code == 200
    assert appr_res.json()["status"] == "approved"
    assert appr_res.json()["valid_until"] is not None

    # 4. Check /consents/mine
    mine_res = client.get("/api/v1/consents/mine", headers=headers)
    assert mine_res.status_code == 200
    assert len(mine_res.json()) >= 1

    # 5. Revoke consent
    rev_res = client.patch(f"/api/v1/consents/{consent_id}", json={
        "action": "revoke",
    }, headers=headers)
    assert rev_res.status_code == 200
    assert rev_res.json()["status"] == "revoked"
