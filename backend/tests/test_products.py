import pytest
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def producer_token(client):
    reg = client.post("/api/v1/auth/register", json={
        "email": "prod_test@echochain.org",
        "password": "Password123!",
        "full_name": "Producer Tester",
        "role": "PRODUCER",
        "organization": "Highland Co"
    })
    return reg.json()["access_token"]


@pytest.fixture
def consumer_token(client):
    reg = client.post("/api/v1/auth/register", json={
        "email": "consumer_test@echochain.org",
        "password": "Password123!",
        "full_name": "Consumer Tester",
        "role": "CONSUMER"
    })
    return reg.json()["access_token"]


def test_product_crud_and_stats_flow(client, producer_token, consumer_token):
    headers = {"Authorization": f"Bearer {producer_token}"}

    # 1. Fetch Stats
    res_stats = client.get("/api/v1/products/stats", headers=headers)
    assert res_stats.status_code == 200
    stats = res_stats.json()
    assert "total_products" in stats
    assert "registered_batches" in stats
    assert "verified_products" in stats

    # 2. Create Product (Producer)
    create_payload = {
        "product_name": "Test Sidama Arabica",
        "product_type": "Specialty Coffee",
        "brand": "Highland Terroir",
        "region": "Sidama Zone",
        "country": "Ethiopia",
        "harvest_date": "2026-08-01",
        "description": "High altitude single estate coffee.",
        "certification_status": "Certified Organic",
        "protected_gps_latitude": 6.16,
        "protected_gps_longitude": 38.20
    }
    res_create = client.post("/api/v1/products", json=create_payload, headers=headers)
    assert res_create.status_code == 201
    prod_data = res_create.json()
    prod_id = prod_data["id"]
    assert prod_data["product_name"] == "Test Sidama Arabica"
    assert "batch_id" in prod_data
    assert prod_data["protected_gps_latitude"] == 6.16  # Owner sees protected GPS

    # 3. Consumer tries to create product -> 403 Forbidden
    res_cons_create = client.post(
        "/api/v1/products",
        json=create_payload,
        headers={"Authorization": f"Bearer {consumer_token}"}
    )
    assert res_cons_create.status_code == 403

    # 4. List Producer's Own Products
    res_list = client.get("/api/v1/products/my-products", headers=headers)
    assert res_list.status_code == 200
    list_data = res_list.json()
    assert list_data["total"] >= 1
    assert any(item["id"] == prod_id for item in list_data["items"])

    # 5. Search Product by Name
    res_search = client.get("/api/v1/products?search=Sidama")
    assert res_search.status_code == 200
    search_data = res_search.json()
    assert any(item["id"] == prod_id for item in search_data["items"])

    # 6. Update Product
    update_payload = {
        "product_name": "Updated Sidama Arabica",
        "verification_status": "VERIFIED"
    }
    res_update = client.put(f"/api/v1/products/{prod_id}", json=update_payload, headers=headers)
    assert res_update.status_code == 200
    assert res_update.json()["product_name"] == "Updated Sidama Arabica"
    assert res_update.json()["verification_status"] == "VERIFIED"

    # 7. Delete Product
    res_del = client.delete(f"/api/v1/products/{prod_id}", headers=headers)
    assert res_del.status_code == 200

    # 8. Verify Deletion
    res_get_del = client.get(f"/api/v1/products/{prod_id}", headers=headers)
    assert res_get_del.status_code == 404
