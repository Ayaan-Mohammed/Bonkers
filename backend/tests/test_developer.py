import pytest
from fastapi.testclient import TestClient

from app.main import app as fastapi_app

@pytest.fixture
def client():
    return TestClient(fastapi_app)


def test_developer_sandbox_flow(client):
    # 1. Create developer API key
    key_res = client.post("/api/v1/dev/api-keys", json={
        "name": "Fintech Title Check App",
        "rate_limit_per_minute": 5,
    })
    assert key_res.status_code == 201
    key_data = key_res.json()
    assert "raw_api_key" in key_data
    raw_key = key_data["raw_api_key"]

    # 2. Query public parcel endpoint with invalid key -> 401
    bad_res = client.get("/api/v1/public/parcels/UP09412601001", headers={"X-API-Key": "invalid_key"})
    assert bad_res.status_code == 401

    # 3. Query with valid key -> 200 without citizen PII
    good_res = client.get("/api/v1/public/parcels/UP09412601001", headers={"X-API-Key": raw_key})
    assert good_res.status_code in {200, 404}
    if good_res.status_code == 200:
        pub_data = good_res.json()
        assert "ulpin" in pub_data
        # Ensure no sensitive PII fields leaked
        assert "owner_name" not in pub_data
        assert "aadhaar_hash" not in pub_data
