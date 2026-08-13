import io
import pytest
import numpy as np
import scipy.io.wavfile as wav
from fastapi.testclient import TestClient

from app.main import app
from app.services.ipfs_service import IPFSService, IPFSConfigError

client = TestClient(app)


def create_test_wav_bytes() -> bytes:
    sr = 22050
    t = np.linspace(0, 1.0, sr, endpoint=False)
    audio_data = (0.5 * np.sin(2 * np.pi * 440 * t) * 32767).astype(np.int16)
    buf = io.BytesIO()
    wav.write(buf, sr, audio_data)
    return buf.getvalue()


def test_ipfs_cid_computation():
    wav_bytes = create_test_wav_bytes()
    cid_a = IPFSService.compute_sha256_cid(wav_bytes)
    cid_b = IPFSService.compute_sha256_cid(wav_bytes)

    assert cid_a.startswith("bafybeih")
    assert cid_a == cid_b  # Deterministic multihash CID derivation


def test_phase10_ipfs_upload_and_retrieve_pipeline():
    # 1. Auth & Setup
    reg_resp = client.post(
        "/api/v1/auth/register",
        json={
            "email": "ipfs_producer@echochain.org",
            "password": "Password123!",
            "full_name": "IPFS Producer",
            "role": "PRODUCER",
            "organization": "EchoChain Web3 Lab"
        }
    )
    token = reg_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Product & Audio Upload
    prod_resp = client.post(
        "/api/v1/products",
        json={
            "product_name": "Decentralized Sidama Batch",
            "product_type": "Coffee",
            "brand": "EchoChain IPFS",
            "region": "Sidama",
            "country": "Ethiopia",
            "harvest_date": "2026-08-11"
        },
        headers=headers
    )
    product = prod_resp.json()

    wav_bytes = create_test_wav_bytes()
    cap_resp = client.post(
        "/api/v1/audio/upload",
        files={"file": ("ipfs_audio.wav", io.BytesIO(wav_bytes), "audio/wav")},
        data={"product_id": str(product["id"])},
        headers=headers
    )
    capture_id = cap_resp.json()["capture_id"]

    # Analyze & create provenance record
    client.post(f"/api/v1/acoustic/analyze/{capture_id}", headers=headers)
    prov_req = client.post(
        "/api/v1/provenance",
        json={"product_id": product["id"], "capture_id": capture_id},
        headers=headers
    )
    prov_id = prov_req.json()["provenance_id"]

    # 3. Upload / Pin to IPFS
    upload_resp = client.post(f"/api/ipfs/upload/{prov_id}", headers=headers)
    assert upload_resp.status_code == 200
    upload_data = upload_resp.json()

    assert upload_data["provenance_id"] == prov_id
    assert upload_data["ipfs_cid"].startswith("bafybeih")
    assert upload_data["status"] == "PINNED_TO_IPFS"
    assert "https://gateway.pinata.cloud/ipfs/" in upload_data["ipfs_url"]

    # 4. Consumer GET IPFS audio player metadata
    get_resp = client.get(f"/api/ipfs/{prov_id}")
    assert get_resp.status_code == 200
    get_data = get_resp.json()

    assert get_data["provenance_id"] == prov_id
    assert get_data["is_pinned"] is True
    assert get_data["ipfs_cid"] == upload_data["ipfs_cid"]
