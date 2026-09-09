import pytest
from fastapi.testclient import TestClient

from app.main import app as fastapi_app

@pytest.fixture
def client():
    return TestClient(fastapi_app)


def test_dispute_risk_intelligence(client):
    list_res = client.get("/api/v1/parcels?limit=5")
    assert list_res.status_code == 200
    parcels = list_res.json()

    for p in parcels:
        ulpin = p["ulpin"]
        res = client.get(f"/api/v1/parcels/{ulpin}/intelligence")
        assert res.status_code == 200
        data = res.json()
        assert data["ulpin"] == ulpin
        assert 0.0 <= data["score"] <= 100.0
        assert data["trust_level"] in {"HIGH", "MEDIUM", "LOW"}
        assert "factors" in data
        assert "area_variance_pct" in data["factors"]
        assert "encumbrance_active" in data["factors"]
        assert "explanations" in data
        assert len(data["explanations"]) >= 1
