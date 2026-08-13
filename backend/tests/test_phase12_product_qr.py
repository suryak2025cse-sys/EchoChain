import io
import pytest
import numpy as np
import scipy.io.wavfile as wav
from fastapi.testclient import TestClient

from app.main import app
from app.services.qr_service import QRService

client = TestClient(app)


def create_test_wav_bytes() -> bytes:
    sr = 22050
    t = np.linspace(0, 1.0, sr, endpoint=False)
    audio_data = (0.5 * np.sin(2 * np.pi * 440 * t) * 32767).astype(np.int16)
    buf = io.BytesIO()
    wav.write(buf, sr, audio_data)
    return buf.getvalue()


def test_qr_service_formatting_and_generation():
    prod_id = QRService.generate_product_id("Specialty Coffee", 1)
    assert prod_id == "ECH-SPECIALTYCOFFEE-2026-0001"

    url = f"http://localhost:5173/verify/{prod_id}"
    qr_b64 = QRService.generate_qr_b64(url)
    assert qr_b64.startswith("data:image/png;base64,")

    qr_svg = QRService.generate_qr_svg(url)
    assert "<svg" in qr_svg


def test_phase12_product_qr_and_public_verification_pipeline():
    # 1. Auth & Producer Register
    reg_resp = client.post(
        "/api/v1/auth/register",
        json={
            "email": "qr_producer@echochain.org",
            "password": "Password123!",
            "full_name": "QR Producer",
            "role": "PRODUCER",
            "organization": "EchoChain Consumer Lab"
        }
    )
    token = reg_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Product Registration
    prod_resp = client.post(
        "/api/v1/products",
        json={
            "product_name": "Single Origin Coffee",
            "product_type": "Coffee",
            "brand": "EchoChain QR",
            "region": "Sidama",
            "country": "Ethiopia",
            "harvest_date": "2026-08-12",
            "protected_gps_latitude": 6.1622,
            "protected_gps_longitude": 38.2058
        },
        headers=headers
    )
    product = prod_resp.json()
    prod_id = product["id"]
    echo_prod_id = product.get("echochain_product_id") or f"ECH-COFFEE-2026-{prod_id:04d}"

    # 3. Fetch Product QR Code
    qr_resp = client.get(f"/api/v1/products/{prod_id}/qr")
    assert qr_resp.status_code == 200
    qr_data = qr_resp.json()
    assert qr_data["qr_code_b64"].startswith("data:image/png;base64,")
    assert "/verify/" in qr_data["verification_url"]

    # 4. Create Audio & Provenance & Polygon Anchor
    wav_bytes = create_test_wav_bytes()
    cap_resp = client.post(
        "/api/v1/audio/upload",
        files={"file": ("qr_audio.wav", io.BytesIO(wav_bytes), "audio/wav")},
        data={"product_id": str(prod_id)},
        headers=headers
    )
    capture_id = cap_resp.json()["capture_id"]
    client.post(f"/api/v1/acoustic/analyze/{capture_id}", headers=headers)

    prov_req = client.post(
        "/api/v1/provenance",
        json={"product_id": prod_id, "capture_id": capture_id},
        headers=headers
    )
    prov_id = prov_req.json()["provenance_id"]
    client.post(f"/api/polygon/anchor/{prov_id}", headers=headers)

    # 5. Public Consumer Verification Query (Scanned via QR Code)
    pub_ver_resp = client.get(f"/api/verify/{echo_prod_id}")
    assert pub_ver_resp.status_code == 200
    pub_data = pub_ver_resp.json()

    assert pub_data["product_name"] == "Single Origin Coffee"
    assert pub_data["region"] == "Sidama"
    assert pub_data["country"] == "Ethiopia"
    assert pub_data["verification_status"] == "VERIFIED"
    assert pub_data["acoustic_evidence"]["fingerprint"] is not None
    assert pub_data["cryptographic_proof"]["provenance_hash"] is not None
    assert pub_data["blockchain_proof"]["tx_hash"] is not None

    # Privacy Rule Enforcement Check: No exact GPS or producer PII exposed
    payload_str = str(pub_data).lower()
    assert "protected_gps_latitude" not in payload_str
    assert "protected_gps_longitude" not in payload_str
    assert "qr_producer@echochain.org" not in payload_str
