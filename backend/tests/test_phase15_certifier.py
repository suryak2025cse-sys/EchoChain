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


def test_phase15_certifier_review_and_immutable_audit_logging():
    import uuid
    uid = uuid.uuid4().hex[:6]
    prod_email = f"p15_prod_{uid}@echochain.org"
    cert_email = f"p15_cert_{uid}@echochain.org"

    # 1. Register Producer User
    prod_reg = client.post(
        "/api/v1/auth/register",
        json={
            "email": prod_email,
            "password": "Password123!",
            "full_name": "Phase 15 Producer",
            "role": "PRODUCER",
            "organization": "Yirgacheffe Organic Farmers"
        }
    )
    assert prod_reg.status_code == 200
    prod_token = prod_reg.json()["access_token"]
    prod_headers = {"Authorization": f"Bearer {prod_token}"}

    # 2. Register Certifier Auditor User
    cert_reg = client.post(
        "/api/v1/auth/register",
        json={
            "email": cert_email,
            "password": "Password123!",
            "full_name": "Phase 15 Certifier",
            "role": "CERTIFIER",
            "organization": "Global Organic Standards Board"
        }
    )
    assert cert_reg.status_code == 200
    cert_token = cert_reg.json()["access_token"]
    cert_headers = {"Authorization": f"Bearer {cert_token}"}

    # 3. Producer creates product & audio & provenance
    prod_resp = client.post(
        "/api/v1/products",
        json={
            "product_name": "Yirgacheffe Special Grade 1",
            "product_type": "Coffee",
            "brand": "Highland Organic",
            "region": "Yirgacheffe",
            "country": "Ethiopia",
            "harvest_date": "2026-02-12"
        },
        headers=prod_headers
    )
    assert prod_resp.status_code == 201
    prod_id = prod_resp.json()["id"]

    wav_bytes = create_test_wav_bytes()
    cap_resp = client.post(
        "/api/v1/audio/upload",
        files={"file": ("p15_audio.wav", io.BytesIO(wav_bytes), "audio/wav")},
        data={"product_id": str(prod_id)},
        headers=prod_headers
    )
    capture_id = cap_resp.json()["capture_id"]

    prov_req = client.post(
        "/api/v1/provenance",
        json={"product_id": prod_id, "capture_id": capture_id},
        headers=prod_headers
    )
    assert prov_req.status_code in [200, 201]
    prov_id = prov_req.json()["provenance_id"]

    # 4. Certifier lists review queue
    queue_resp = client.get("/api/v1/certifier/provenance", headers=cert_headers)
    assert queue_resp.status_code == 200
    queue_data = queue_resp.json()
    assert queue_data["total"] >= 1

    # 5. Certifier inspects 7 evidence proof layers
    detail_resp = client.get(f"/api/v1/certifier/provenance/{prov_id}", headers=cert_headers)
    assert detail_resp.status_code == 200
    detail = detail_resp.json()
    assert detail["provenance_id"] == prov_id
    assert detail["product"]["product_name"] == "Yirgacheffe Special Grade 1"
    assert detail["audio_capture"]["capture_id"] == capture_id
    assert detail["acoustic_fingerprint"]["fingerprint"] is not None
    assert detail["liveness_evidence"]["liveness_score"] is not None
    assert detail["hash_verification_status"] == "VALID"

    # 6. Certifier executes APPROVE decision with mandatory audit reason
    decide_resp = client.post(
        f"/api/v1/certifier/decide/{prov_id}",
        json={
            "decision": "APPROVE",
            "reason": "All 7 evidence layers verified compliant with EchoChain standard v1.0."
        },
        headers=cert_headers
    )
    assert decide_resp.status_code == 200
    decide_data = decide_resp.json()
    assert decide_data["decision"] == "APPROVE"
    assert decide_data["new_status"] == "APPROVED"
    assert "audit_log_id" in decide_data

    # 7. Verify Immutable Audit Trail API
    audit_resp = client.get("/api/v1/certifier/audit-logs", headers=cert_headers)
    assert audit_resp.status_code == 200
    audit_data = audit_resp.json()
    assert audit_data["total"] >= 1
    found_log = any("CERTIFICATION_APPROVED" in l["action"] for l in audit_data["items"])
    assert found_log is True
