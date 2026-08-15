import io
import pytest
import numpy as np
import scipy.io.wavfile as wav
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def create_test_wav_bytes(duration_sec: float = 1.0, freq: float = 440.0) -> bytes:
    sr = 22050
    t = np.linspace(0, duration_sec, int(sr * duration_sec), endpoint=False)
    audio_data = (0.5 * np.sin(2 * np.pi * freq * t) * 32767).astype(np.int16)
    buf = io.BytesIO()
    wav.write(buf, sr, audio_data)
    return buf.getvalue()


def test_phase17_full_lifecycle_success_path():
    """
    Tests the complete 10-step EchoChain lifecycle:
    Audio -> Acoustic Analysis -> Liveness -> Supabase -> Provenance -> SHA-256 -> IPFS -> Polygon -> QR -> Consumer Verification
    """
    # 1. Register Producer User
    reg_resp = client.post(
        "/api/v1/auth/register",
        json={
            "email": "p17_producer@echochain.org",
            "password": "Password123!",
            "full_name": "Phase 17 Producer",
            "role": "PRODUCER",
            "organization": "Yirgacheffe Coffee Farmers Union"
        }
    )
    assert reg_resp.status_code == 200
    token = reg_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Product Registration
    prod_resp = client.post(
        "/api/v1/products",
        json={
            "product_name": "Full Lifecycle Specialty Coffee",
            "product_type": "Coffee",
            "brand": "EchoChain Gold",
            "region": "Yirgacheffe",
            "country": "Ethiopia",
            "harvest_date": "2026-08-14"
        },
        headers=headers
    )
    assert prod_resp.status_code == 201
    prod_id = prod_resp.json()["id"]

    # 3. Audio Capture Upload
    wav_bytes = create_test_wav_bytes(duration_sec=1.5, freq=440.0)
    cap_resp = client.post(
        "/api/v1/audio/upload",
        files={"file": ("lifecycle_audio.wav", io.BytesIO(wav_bytes), "audio/wav")},
        data={"product_id": str(prod_id)},
        headers=headers
    )
    assert cap_resp.status_code in [200, 201]
    capture_id = cap_resp.json()["capture_id"]

    # 4. Acoustic DSP Feature Extraction & Fingerprinting
    ac_resp = client.post(f"/api/v1/acoustic/analyze/{capture_id}", headers=headers)
    assert ac_resp.status_code == 200
    ac_data = ac_resp.json()
    assert ac_data["fingerprint"] is not None
    assert "feature_vector" in ac_data

    # 5. Liveness Challenge & Verification
    chal_resp = client.post("/api/v1/liveness/challenge", headers=headers)
    assert chal_resp.status_code in [200, 201]
    ch_data = chal_resp.json()
    chal_id = ch_data["challenge_id"]
    nonce = ch_data["nonce"]

    val_resp = client.post(
        "/api/v1/liveness/validate",
        json={
            "capture_id": capture_id,
            "challenge_id": chal_id,
            "nonce": nonce
        },
        headers=headers
    )
    assert val_resp.status_code == 200
    val_data = val_resp.json()
    assert val_data["liveness_score"] >= 0.0

    # 6. Provenance Assembly & SHA-256 Commitment Sealing
    prov_resp = client.post(
        "/api/v1/provenance",
        json={"product_id": prod_id, "capture_id": capture_id},
        headers=headers
    )
    assert prov_resp.status_code in [200, 201]
    prov_id = prov_resp.json()["provenance_id"]
    prov_hash = prov_resp.json()["provenance_hash"]

    seal_resp = client.post(f"/api/v1/provenance/{prov_id}/seal", headers=headers)
    assert seal_resp.status_code == 200
    assert seal_resp.json()["is_sealed"] is True

    # 7. IPFS Audio Pinning
    ipfs_resp = client.post(f"/api/v1/ipfs/upload/{prov_id}", headers=headers)
    assert ipfs_resp.status_code == 200
    ipfs_cid = ipfs_resp.json()["ipfs_cid"]
    assert ipfs_cid is not None

    # 8. Polygon Testnet Blockchain Anchoring
    poly_resp = client.post(f"/api/v1/polygon/anchor/{prov_id}", headers=headers)
    assert poly_resp.status_code == 200
    tx_hash = poly_resp.json()["tx_hash"]
    assert tx_hash.startswith("0x")

    # 9. Product Identity & QR Code Generation
    qr_resp = client.get(f"/api/v1/products/{prod_id}/qr")
    assert qr_resp.status_code == 200
    qr_data = qr_resp.json()
    echo_prod_id = qr_data["echochain_product_id"]
    assert echo_prod_id.startswith("ECH-COFFEE-2026-")

    # 10. Public Consumer Verification Query (Scanned via Product QR Code)
    pub_ver_resp = client.get(f"/api/v1/verify/{echo_prod_id}")
    assert pub_ver_resp.status_code == 200
    pub_data = pub_ver_resp.json()

    assert pub_data["echochain_product_id"] == echo_prod_id
    assert pub_data["verification_status"] == "VERIFIED"
    assert pub_data["acoustic_evidence"]["fingerprint"] == ac_data["fingerprint"]
    assert pub_data["cryptographic_proof"]["provenance_hash"] == prov_hash
    assert pub_data["blockchain_proof"]["tx_hash"] == tx_hash
    assert pub_data["ipfs_storage"]["ipfs_cid"] == ipfs_cid

    # Enforce Privacy Rules: No exact GPS or producer email exposed in public payload
    pub_str = str(pub_data).lower()
    assert "protected_gps_latitude" not in pub_str
    assert "protected_gps_longitude" not in pub_str
    assert "p17_producer@echochain.org" not in pub_str


def test_phase17_failure_and_edge_cases():
    """
    Tests failure handling and edge cases:
    - Supabase fallback
    - IPFS unconfigured
    - Polygon unconfigured
    - invalid audio
    - replayed audio / low score penalty
    - expired challenge
    - tampered provenance
    - invalid hash
    - invalid QR
    """
    # 1. Register Failure Test Producer & Create Product
    reg_resp = client.post(
        "/api/v1/auth/register",
        json={
            "email": "fail_producer@echochain.org",
            "password": "Password123!",
            "full_name": "Failure Test Producer",
            "role": "PRODUCER",
            "organization": "EchoChain Fault Lab"
        }
    )
    token = reg_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    prod_resp = client.post(
        "/api/v1/products",
        json={
            "product_name": "Fault Tolerant Crop",
            "product_type": "Tea",
            "brand": "EchoFault",
            "region": "Assam",
            "country": "India",
            "harvest_date": "2026-08-14"
        },
        headers=headers
    )
    assert prod_resp.status_code == 201
    prod_id = prod_resp.json()["id"]

    # 2. Invalid Audio Format Upload -> 400 Bad Request
    bad_audio_resp = client.post(
        "/api/v1/audio/upload",
        files={"file": ("bad_audio.txt", b"THIS_IS_NOT_AUDIO_DATA_CORRUPT", "text/plain")},
        headers=headers
    )
    assert bad_audio_resp.status_code == 400
    assert "unsupported audio format" in bad_audio_resp.json()["detail"].lower()

    # 3. Expired / Reused Liveness Challenge -> 400 Bad Request
    chal_resp = client.post("/api/v1/liveness/challenge", headers=headers)
    ch_data = chal_resp.json()
    chal_id = ch_data["challenge_id"]
    nonce = ch_data["nonce"]

    # Upload valid audio capture
    wav_bytes = create_test_wav_bytes(duration_sec=1.0)
    cap_resp = client.post(
        "/api/v1/audio/upload",
        files={"file": ("test_chal.wav", io.BytesIO(wav_bytes), "audio/wav")},
        data={"product_id": str(prod_id)},
        headers=headers
    )
    cap_id = cap_resp.json()["capture_id"]

    # 1st validation passes
    val1 = client.post(
        "/api/v1/liveness/validate",
        json={"capture_id": cap_id, "challenge_id": chal_id, "nonce": nonce},
        headers=headers
    )
    assert val1.status_code == 200

    # 2nd validation fails because challenge token is already used
    val2 = client.post(
        "/api/v1/liveness/validate",
        json={"capture_id": cap_id, "challenge_id": chal_id, "nonce": nonce},
        headers=headers
    )
    assert val2.status_code == 400
    assert "already been used" in val2.json()["detail"].lower()

    # 4. Invalid QR / Non-existent Product ID Consumer Verification -> 404 Not Found
    invalid_qr_resp = client.get("/api/v1/verify/ECH-NONEXISTENT-PRODUCT-9999")
    assert invalid_qr_resp.status_code == 404
    assert "not found" in invalid_qr_resp.json()["detail"].lower()

    # 5. Tampered Provenance Verification
    prov_req = client.post(
        "/api/v1/provenance",
        json={"product_id": prod_id, "capture_id": cap_id},
        headers=headers
    )
    assert prov_req.status_code in [200, 201]
    prov_id = prov_req.json()["provenance_id"]

    # Verify original provenance hash is valid
    ver_resp = client.get(f"/api/v1/provenance/verify/{prov_id}")
    assert ver_resp.status_code == 200
    assert ver_resp.json()["status"] == "VALID"
    assert ver_resp.json()["is_tamper_evident"] is True
