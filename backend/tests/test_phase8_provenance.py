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


def test_phase8_provenance_full_pipeline():
    # 1. Register & Auth
    reg_resp = client.post(
        "/api/v1/auth/register",
        json={
            "email": "prov_prod_phase8_v2@echochain.org",
            "password": "Password123!",
            "full_name": "Provenance Producer Phase8",
            "role": "PRODUCER",
            "organization": "Highland Co-op"
        }
    )
    assert reg_resp.status_code == 200
    token = reg_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Create Product with protected GPS
    prod_resp = client.post(
        "/api/v1/products",
        json={
            "product_name": "Highland Yirgacheffe Coffee",
            "product_type": "Specialty Coffee",
            "brand": "EchoChain Reserve",
            "region": "Sidama",
            "country": "Ethiopia",
            "protected_gps_latitude": 6.1622,
            "protected_gps_longitude": 38.2058,
            "harvest_date": "2026-08-01"
        },
        headers=headers
    )
    assert prod_resp.status_code == 201
    product = prod_resp.json()
    product_id = product["id"]
    batch_id = product["batch_id"]

    # 3. Create Audio Capture (Phase 5) via /api/v1/audio/upload
    wav_bytes = create_test_wav_bytes()
    cap_resp = client.post(
        "/api/v1/audio/upload",
        files={"file": ("prov_audio.wav", io.BytesIO(wav_bytes), "audio/wav")},
        data={"product_id": str(product_id)},
        headers=headers
    )
    assert cap_resp.status_code == 201
    capture_id = cap_resp.json()["capture_id"]

    # 4. Generate Acoustic Fingerprint (Phase 6) via /api/v1/acoustic/analyze/{capture_id}
    acoust_resp = client.post(f"/api/v1/acoustic/analyze/{capture_id}", headers=headers)
    assert acoust_resp.status_code == 200
    fp_hash = acoust_resp.json()["fingerprint"]

    # 5. Assemble Provenance Record (Phase 8) via /api/v1/provenance
    prov_req = client.post(
        "/api/v1/provenance",
        json={"product_id": product_id, "capture_id": capture_id},
        headers=headers
    )
    assert prov_req.status_code == 201
    prov_data = prov_req.json()

    assert prov_data["provenance_id"].startswith("ECH-PROV-2026-")
    assert prov_data["product_id"] == product_id
    assert prov_data["batch_id"] == batch_id
    assert prov_data["region"] == "Sidama"
    assert prov_data["country"] == "Ethiopia"
    assert prov_data["fingerprint"] == fp_hash
    assert prov_data["status"] == "READY_FOR_SEAL"
    assert "provenance_hash" in prov_data

    # Ensure Exact GPS is NOT exposed in public provenance metadata
    assert "protected_gps_latitude" not in prov_data["metadata_json"]["product"]
    assert "protected_gps_longitude" not in prov_data["metadata_json"]["product"]

    # 6. Fetch Provenance Detail via /api/provenance/{id}
    get_resp = client.get(f"/api/provenance/{prov_data['provenance_id']}")
    assert get_resp.status_code == 200
    assert get_resp.json()["provenance_id"] == prov_data["provenance_id"]

    # 7. List Provenance Records
    list_resp = client.get("/api/v1/provenance", headers=headers)
    assert list_resp.status_code == 200
    assert list_resp.json()["total"] >= 1
