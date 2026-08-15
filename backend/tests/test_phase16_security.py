import io
import pytest
import numpy as np
import scipy.io.wavfile as wav
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def create_test_wav_bytes() -> bytes:
    sr = 22050
    t = np.linspace(0, 1.0, sr, endpoint=False)
    audio_data = (0.5 * np.sin(2 * np.pi * 440 * t) * 32767).astype(np.int16)
    buf = io.BytesIO()
    wav.write(buf, sr, audio_data)
    return buf.getvalue()


def test_phase16_security_detection_and_monitoring_pipeline():
    import uuid
    uid = uuid.uuid4().hex[:6]
    prod_email = f"sec_prod_{uid}@echochain.org"
    admin_email = f"sec_admin_{uid}@echochain.org"

    # 1. Register Producer User
    prod_reg = client.post(
        "/api/v1/auth/register",
        json={
            "email": prod_email,
            "password": "Password123!",
            "full_name": "Security Test Producer",
            "role": "PRODUCER",
            "organization": "Highland Organic"
        }
    )
    assert prod_reg.status_code == 200
    prod_token = prod_reg.json()["access_token"]
    prod_headers = {"Authorization": f"Bearer {prod_token}"}

    # 2. Register Admin Security User
    admin_reg = client.post(
        "/api/v1/auth/register",
        json={
            "email": admin_email,
            "password": "Password123!",
            "full_name": "Security Administrator",
            "role": "ADMIN",
            "organization": "EchoChain Security Operations Center"
        }
    )
    assert admin_reg.status_code == 200
    admin_token = admin_reg.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 3. Create Product & Upload 2 Identical Audio Captures (Duplicate Capture Trigger)
    prod_resp = client.post(
        "/api/v1/products",
        json={
            "product_name": "Security Test Crop",
            "product_type": "Beans",
            "brand": "EchoSecurity",
            "region": "Sidama",
            "country": "Ethiopia",
            "harvest_date": "2026-08-14"
        },
        headers=prod_headers
    )
    assert prod_resp.status_code == 201
    prod_id = prod_resp.json()["id"]

    wav_bytes = create_test_wav_bytes()
    cap1_resp = client.post(
        "/api/v1/audio/upload",
        files={"file": ("sec_audio1.wav", io.BytesIO(wav_bytes), "audio/wav")},
        data={"product_id": str(prod_id)},
        headers=prod_headers
    )
    assert cap1_resp.status_code in [200, 201]
    cap1_id = cap1_resp.json()["capture_id"]

    cap2_resp = client.post(
        "/api/v1/audio/upload",
        files={"file": ("sec_audio1.wav", io.BytesIO(wav_bytes), "audio/wav")},
        data={"product_id": str(prod_id)},
        headers=prod_headers
    )
    assert cap2_resp.status_code in [200, 201]
    cap2_id = cap2_resp.json()["capture_id"]

    # 4. Create Provenance Record & Seal
    prov_req = client.post(
        "/api/v1/provenance",
        json={"product_id": prod_id, "capture_id": cap1_id},
        headers=prod_headers
    )
    assert prov_req.status_code in [200, 201]
    prov_id = prov_req.json()["provenance_id"]

    client.post(f"/api/v1/provenance/seal/{prov_id}", headers=prod_headers)

    # 5. Trigger Automated Security System Scan
    scan_resp = client.post("/api/v1/security/scan", headers=admin_headers)
    assert scan_resp.status_code == 200
    scan_data = scan_resp.json()
    assert scan_data["scanned_records"] >= 1
    assert scan_data["scanned_captures"] >= 2
    assert "summary_message" in scan_data

    # 6. Fetch Security Metrics
    metrics_resp = client.get("/api/v1/security/metrics", headers=admin_headers)
    assert metrics_resp.status_code == 200
    metrics_data = metrics_resp.json()
    assert "total_events" in metrics_data
    assert "by_risk_level" in metrics_data
    assert "LOW" in metrics_data["by_risk_level"]
    assert "CRITICAL" in metrics_data["by_risk_level"]

    # 7. List Security Events
    events_resp = client.get("/api/v1/security/events", headers=admin_headers)
    assert events_resp.status_code == 200
    events_data = events_resp.json()
    assert events_data["total"] >= 1

    event_item = events_data["items"][0]
    sec_id = event_item["event_id"]

    # 8. Resolve Security Event
    resolve_resp = client.post(
        f"/api/v1/security/events/{sec_id}/resolve",
        json={
            "status": "RESOLVED",
            "resolution_notes": "Verified duplicate capture was benign test submission. Threat resolved."
        },
        headers=admin_headers
    )
    assert resolve_resp.status_code == 200
    resolve_data = resolve_resp.json()
    assert resolve_data["status"] == "RESOLVED"
    assert resolve_data["resolution_notes"] == "Verified duplicate capture was benign test submission. Threat resolved."
