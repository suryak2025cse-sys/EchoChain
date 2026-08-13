import io
import pytest
import numpy as np
import scipy.io.wavfile as wav
from fastapi.testclient import TestClient

from app.main import app
from app.services.polygon_service import PolygonService, BlockchainNotConfiguredError

client = TestClient(app)


def create_test_wav_bytes() -> bytes:
    sr = 22050
    t = np.linspace(0, 1.0, sr, endpoint=False)
    audio_data = (0.5 * np.sin(2 * np.pi * 440 * t) * 32767).astype(np.int16)
    buf = io.BytesIO()
    wav.write(buf, sr, audio_data)
    return buf.getvalue()


def test_polygon_privacy_and_anchor_payload():
    res = PolygonService.anchor_provenance_record(
        provenance_id="ECH-PROV-2026-000001",
        provenance_hash="7f3a9b2c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a",
        ipfs_cid="bafybeih123456789"
    )

    assert res["provenance_id"] == "ECH-PROV-2026-000001"
    assert res["tx_hash"].startswith("0x")
    assert res["block_number"] > 0
    assert res["status"] == "ANCHORED_ON_POLYGON"

    # Verify no GPS or user PII leak in output dictionary
    assert "gps" not in str(res).lower()
    assert "latitude" not in str(res).lower()
    assert "email" not in str(res).lower()


def test_phase11_polygon_anchor_and_verify_pipeline():
    # 1. Auth & Setup
    reg_resp = client.post(
        "/api/v1/auth/register",
        json={
            "email": "polygon_producer@echochain.org",
            "password": "Password123!",
            "full_name": "Polygon Relayer",
            "role": "PRODUCER",
            "organization": "EchoChain Web3 Lab"
        }
    )
    token = reg_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Product, Audio Upload & Provenance
    prod_resp = client.post(
        "/api/v1/products",
        json={
            "product_name": "Polygon Sealed Sidama Lot",
            "product_type": "Coffee",
            "brand": "EchoChain Web3",
            "region": "Sidama",
            "country": "Ethiopia",
            "harvest_date": "2026-08-12"
        },
        headers=headers
    )
    product = prod_resp.json()

    wav_bytes = create_test_wav_bytes()
    cap_resp = client.post(
        "/api/v1/audio/upload",
        files={"file": ("polygon_audio.wav", io.BytesIO(wav_bytes), "audio/wav")},
        data={"product_id": str(product["id"])},
        headers=headers
    )
    capture_id = cap_resp.json()["capture_id"]

    client.post(f"/api/v1/acoustic/analyze/{capture_id}", headers=headers)
    prov_req = client.post(
        "/api/v1/provenance",
        json={"product_id": product["id"], "capture_id": capture_id},
        headers=headers
    )
    prov_id = prov_req.json()["provenance_id"]

    # 3. Anchor Provenance on Polygon Testnet
    anchor_resp = client.post(f"/api/polygon/anchor/{prov_id}", headers=headers)
    assert anchor_resp.status_code == 200
    anc_data = anchor_resp.json()

    assert anc_data["provenance_id"] == prov_id
    assert anc_data["tx_hash"].startswith("0x")
    assert anc_data["block_number"] > 0
    assert anc_data["status"] == "ANCHORED_ON_POLYGON"

    # 4. Verify On-Chain Anchor
    verify_resp = client.get(f"/api/polygon/verify/{prov_id}")
    assert verify_resp.status_code == 200
    ver_data = verify_resp.json()

    assert ver_data["provenance_id"] == prov_id
    assert ver_data["is_anchored"] is True
    assert ver_data["status"] == "VALID_ONCHAIN"
    assert ver_data["tx_hash"] == anc_data["tx_hash"]
