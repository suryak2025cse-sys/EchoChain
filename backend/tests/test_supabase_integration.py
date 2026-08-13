import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.supabase_client import get_supabase_client, get_supabase_health_status


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client


def test_supabase_client_initialization():
    supa = get_supabase_client()
    assert supa is not None


def test_supabase_health_endpoint(client):
    res = client.get("/api/v1/health/supabase")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"
    assert data["database"] == "supabase"
    assert data["connected"] is True
    assert "supabase.co" in data["supabase_url"]
