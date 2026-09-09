import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.base import Base
from app.main import app as fastapi_app

# Setup in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


from app.db.session import get_db
from app.models.platform import User

@pytest.fixture(scope="function", autouse=True)
def setup_db():
    User.__table__.create(bind=engine, checkfirst=True)
    fastapi_app.dependency_overrides[get_db] = override_get_db
    yield
    User.__table__.drop(bind=engine, checkfirst=True)
    fastapi_app.dependency_overrides.clear()


@pytest.fixture
def client():
    return TestClient(fastapi_app)


def test_register_and_login_flow(client):
    # 1. Register new user
    reg_payload = {
        "name": "Ramesh Kumar",
        "email": "ramesh@example.com",
        "password": "Password123!",
        "role": "citizen",
        "mobile": "+919876543210",
    }
    reg_res = client.post("/api/v1/auth/register", json=reg_payload)
    assert reg_res.status_code == 201, reg_res.text
    reg_data = reg_res.json()
    assert "access_token" in reg_data
    assert "refresh_token" in reg_data
    assert reg_data["role"] == "citizen"

    # 2. Duplicate registration should fail
    dup_res = client.post("/api/v1/auth/register", json=reg_payload)
    assert dup_res.status_code == 400

    # 3. Login with correct password
    login_res = client.post("/api/v1/auth/login", json={
        "email": "ramesh@example.com",
        "password": "Password123!",
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    refresh_tok = login_res.json()["refresh_token"]

    # 4. Login with incorrect password
    bad_login = client.post("/api/v1/auth/login", json={
        "email": "ramesh@example.com",
        "password": "WrongPassword",
    })
    assert bad_login.status_code == 401

    # 5. Access /auth/me with Bearer token
    me_res = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["email"] == "ramesh@example.com"
    assert me_data["name"] == "Ramesh Kumar"

    # 6. Refresh token
    ref_res = client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_tok})
    assert ref_res.status_code == 200
    assert "access_token" in ref_res.json()
