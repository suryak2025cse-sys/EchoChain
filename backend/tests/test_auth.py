import pytest
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client


def test_register_and_login_flow(client):
    # 1. Register Producer User
    reg_payload = {
        "email": "harvester@echochain.org",
        "password": "SecurePassword123!",
        "full_name": "Ethiopia Highlands Harvester",
        "role": "PRODUCER",
        "organization": "Yirgacheffe Coffee Co-op"
    }
    res = client.post("/api/v1/auth/register", json=reg_payload)
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["user"]["role"] == "PRODUCER"
    assert data["user"]["email"] == "harvester@echochain.org"

    token = data["access_token"]
    refresh_token = data["refresh_token"]

    # 2. Duplicate Registration Rejection
    res_dup = client.post("/api/v1/auth/register", json=reg_payload)
    assert res_dup.status_code == 400

    # 3. Login with Correct Credentials
    login_payload = {
        "email": "harvester@echochain.org",
        "password": "SecurePassword123!"
    }
    res_login = client.post("/api/v1/auth/login", json=login_payload)
    assert res_login.status_code == 200
    login_data = res_login.json()
    assert "access_token" in login_data

    # 4. Login with Bad Password
    res_bad_pwd = client.post("/api/v1/auth/login", json={
        "email": "harvester@echochain.org",
        "password": "WrongPassword!"
    })
    assert res_bad_pwd.status_code == 401

    # 5. Fetch Profile with Bearer Token
    res_me = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res_me.status_code == 200
    me_data = res_me.json()
    assert me_data["email"] == "harvester@echochain.org"
    assert me_data["role"] == "PRODUCER"

    # 6. Access Producer-Only Route (Should Succeed for Producer)
    res_prod = client.get("/api/v1/auth/producer-only", headers={"Authorization": f"Bearer {token}"})
    assert res_prod.status_code == 200

    # 7. Access Certifier-Only Route (Should Fail 403 for Producer)
    res_cert = client.get("/api/v1/auth/certifier-only", headers={"Authorization": f"Bearer {token}"})
    assert res_cert.status_code == 403

    # 8. Refresh Access Token
    res_ref = client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
    assert res_ref.status_code == 200
    assert "access_token" in res_ref.json()

    # 9. Logout
    res_logout = client.post("/api/v1/auth/logout", headers={"Authorization": f"Bearer {token}"})
    assert res_logout.status_code == 200


def test_forgot_and_reset_password(client):
    # Register Consumer
    reg_payload = {
        "email": "consumer@echochain.org",
        "password": "InitialPassword123!",
        "full_name": "Alice Consumer",
        "role": "CONSUMER"
    }
    client.post("/api/v1/auth/register", json=reg_payload)

    # Forgot Password Request
    res_forgot = client.post("/api/v1/auth/forgot-password", json={"email": "consumer@echochain.org"})
    assert res_forgot.status_code == 200
    msg = res_forgot.json()["message"]
    assert "Dev Reset Token:" in msg

    # Extract Token from dev response message
    reset_token = msg.split("Dev Reset Token: ")[1].rstrip(")")

    # Reset Password
    res_reset = client.post("/api/v1/auth/reset-password", json={
        "token": reset_token,
        "new_password": "NewSecretPassword123!"
    })
    assert res_reset.status_code == 200

    # Login with New Password
    res_login = client.post("/api/v1/auth/login", json={
        "email": "consumer@echochain.org",
        "password": "NewSecretPassword123!"
    })
    assert res_login.status_code == 200
