import pytest
from fastapi.testclient import TestClient

from app.main import app as fastapi_app

@pytest.fixture
def client():
    return TestClient(fastapi_app)


def test_search_parcels(client):
    # 1. Search all parcels
    res = client.get("/api/v1/parcels?limit=10")
    assert res.status_code == 200
    data = res.json()
    assert len(data) > 0
    first = data[0]
    assert "ulpin" in first
    assert "survey_number" in first

    # 2. Search by ULPIN prefix
    res_q = client.get(f"/api/v1/parcels?q={first['ulpin'][:6]}")
    assert res_q.status_code == 200
    assert len(res_q.json()) >= 1


def test_get_parcel_detail_and_subresources(client):
    # Retrieve first parcel
    list_res = client.get("/api/v1/parcels?limit=1")
    ulpin = list_res.json()[0]["ulpin"]

    # 1. Detail with GeoJSON
    detail_res = client.get(f"/api/v1/parcels/{ulpin}")
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert detail["ulpin"] == ulpin
    assert "geometry" in detail
    assert detail["geometry"]["type"] == "Polygon"

    # 2. Record of Rights (RoR)
    ror_res = client.get(f"/api/v1/parcels/{ulpin}/ror")
    assert ror_res.status_code == 200
    assert len(ror_res.json()) >= 1

    # 3. Registrations (Deeds)
    reg_res = client.get(f"/api/v1/parcels/{ulpin}/registrations")
    assert reg_res.status_code == 200
    assert isinstance(reg_res.json(), list)

    # 4. Mutations
    mut_res = client.get(f"/api/v1/parcels/{ulpin}/mutations")
    assert mut_res.status_code == 200
    assert isinstance(mut_res.json(), list)

    # 5. Combined History
    hist_res = client.get(f"/api/v1/parcels/{ulpin}/history")
    assert hist_res.status_code == 200
    history = hist_res.json()
    assert isinstance(history, list)
    if history:
        assert "type" in history[0]
        assert "title" in history[0]

    # 6. Zoning Check
    zone_res = client.post(f"/api/v1/parcels/{ulpin}/zoning-check")
    assert zone_res.status_code == 200
    zone_data = zone_res.json()
    assert "is_within_zone" in zone_data
