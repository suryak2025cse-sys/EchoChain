import io
import pytest
import numpy as np
import scipy.io.wavfile as wav
from fastapi.testclient import TestClient

from app.main import app
from app.services.crypto_commitment import CanonicalHasher

client = TestClient(app)


def create_test_wav_bytes() -> bytes:
    sr = 22050
    t = np.linspace(0, 1.0, sr, endpoint=False)
    audio_data = (0.5 * np.sin(2 * np.pi * 440 * t) * 32767).astype(np.int16)
    buf = io.BytesIO()
    wav.write(buf, sr, audio_data)
    return buf.getvalue()


def test_canonical_hasher_determinism():
    payload_a = CanonicalHasher.build_canonical_payload(
        provenance_id="ECH-PROV-2026-000001",
        capture_id="ECH-CAP-2026-000001",
        acoustic_fingerprint="abc123def456",
        product_name="Yirgacheffe Coffee",
        batch_id="ECH-BATCH-100",
        region="Sidama",
        country="Ethiopia",
        server_timestamp="2026-08-12T19:50:00Z"
    )

    payload_b = CanonicalHasher.build_canonical_payload(
        provenance_id="ECH-PROV-2026-000001",
        capture_id="ECH-CAP-2026-000001",
        acoustic_fingerprint="abc123def456",
        product_name="Yirgacheffe Coffee",
        batch_id="ECH-BATCH-100",
        region="Sidama",
        country="Ethiopia",
        server_timestamp="2026-08-12T19:50:00Z"
    )

    hash_a = CanonicalHasher.compute_sha256_hash(payload_a)
    hash_b = CanonicalHasher.compute_sha256_hash(payload_b)
    assert hash_a == hash_b  # Deterministic hashing property

    # Modify single character to test tamper detection
    payload_modified = dict(payload_a)
    payload_modified["region"] = "sidama"  # lowercase
    hash_modified = CanonicalHasher.compute_sha256_hash(payload_modified)
    assert hash_a != hash_modified


def test_phase9_seal_and_verify_pipeline():
    # 1. Auth & Setup
    reg_resp = client.post(
        "/api/v1/auth/register",
        json={
            "email": "crypto_producer@echochain.org",
            "password": "Password123!",
            "full_name": "Crypto Producer",
            "role": "PRODUCER",
            "organization": "EchoChain Security Lab"
        }
    )
    assert reg_resp.status_code == 200
    token = reg_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Product & Capture
    prod_resp = client.post(
        "/api/v1/products",
        json={
            "product_name": "Organic Sidama Beans",
            "product_type": "Coffee",
            "brand": "EchoChain Crypto",
            "region": "Sidama",
            "country": "Ethiopia",
            "harvest_date": "2026-08-10"
        },
        headers=headers
    )
    product = prod_resp.json()

    wav_bytes = create_test_wav_bytes()
    cap_resp = client.post(
        "/api/v1/audio/upload",
        files={"file": ("crypto_audio.wav", io.BytesIO(wav_bytes), "audio/wav")},
        data={"product_id": str(product["id"])},
        headers=headers
    )
    capture_id = cap_resp.json()["capture_id"]
    client.post(f"/api/v1/acoustic/analyze/{capture_id}", headers=headers)

    # 3. Create Provenance Record
    prov_req = client.post(
        "/api/v1/provenance",
        json={"product_id": product["id"], "capture_id": capture_id},
        headers=headers
    )
    prov_data = prov_req.json()
    prov_id = prov_data["provenance_id"]

    # 4. Seal Provenance Record
    seal_resp = client.post(f"/api/provenance/{prov_id}/seal", headers=headers)
    assert seal_resp.status_code == 200
    seal_data = seal_resp.json()
    assert seal_data["status"] == "SEALED"
    assert seal_data["is_sealed"] is True

    # 5. Verify Cryptographic Integrity
    verify_resp = client.post(f"/api/provenance/verify/{prov_id}")
    assert verify_resp.status_code == 200
    ver_data = verify_resp.json()

    assert ver_data["status"] == "VALID"
    assert ver_data["is_tamper_evident"] is True
    assert ver_data["stored_hash"] == ver_data["computed_hash"]
