import io
import wave
import time
import numpy as np
import pytest
from datetime import datetime, timedelta, timezone
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def user_token(client):
    reg = client.post("/api/v1/auth/register", json={
        "email": "phase7_liveness@echochain.org",
        "password": "Password123!",
        "full_name": "Phase 7 Liveness Tester",
        "role": "PRODUCER",
        "organization": "Liveness Verification Lab"
    })
    return reg.json()["access_token"]


def generate_wav_bytes(duration_sec=3.0, sample_rate=22050):
    t = np.linspace(0, duration_sec, int(sample_rate * duration_sec), False)
    sine = 0.4 * np.sin(2 * np.pi * 440 * t)
    audio_int16 = (sine * 32767).astype(np.int16)

    buf = io.BytesIO()
    with wave.open(buf, "wb") as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(sample_rate)
        wav_file.writeframes(audio_int16.tobytes())
    buf.seek(0)
    return buf.read()


def test_phase7_liveness_challenge_and_validation_flow(client, user_token):
    headers = {"Authorization": f"Bearer {user_token}"}
    wav_bytes = generate_wav_bytes(duration_sec=3.0)

    # 1. Request Liveness Challenge (/api/v1/liveness/challenge)
    res_ch = client.post("/api/v1/liveness/challenge", headers=headers)
    assert res_ch.status_code == 201
    ch_data = res_ch.json()
    challenge_id = ch_data["challenge_id"]
    secret_nonce = ch_data["nonce"]
    assert challenge_id.startswith("CH-2026-")
    assert len(secret_nonce) == 32  # 16-byte hex token

    # 2. Record Live Audio Capture (/api/v1/audio/record)
    res_rec = client.post(
        "/api/v1/audio/record",
        files={"file": ("live_mic_recording.wav", wav_bytes, "audio/wav")},
        data={"duration": "3.0"},
        headers=headers
    )
    assert res_rec.status_code == 201
    capture_id = res_rec.json()["capture_id"]

    # 3. Validate Liveness Challenge & Replay Risk (/api/v1/liveness/validate)
    res_val = client.post(
        "/api/v1/liveness/validate",
        json={
            "capture_id": capture_id,
            "challenge_id": challenge_id,
            "nonce": secret_nonce
        },
        headers=headers
    )
    assert res_val.status_code == 200
    val_data = res_val.json()

    assert val_data["capture_id"] == capture_id
    assert val_data["challenge_id"] == challenge_id
    assert val_data["liveness_score"] > 0
    assert val_data["replay_risk"] in ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    assert val_data["status"] in ["LIVE", "LIKELY_LIVE", "SUSPICIOUS", "REPLAY_SUSPECTED"]
    assert "clipping_ratio" in val_data["analysis_metadata"]

    # 4. Fetch Liveness Results (/api/v1/liveness/{capture_id})
    res_get = client.get(f"/api/v1/liveness/{capture_id}", headers=headers)
    assert res_get.status_code == 200
    assert res_get.json()["liveness_score"] == val_data["liveness_score"]

    # 5. Reused Challenge Error Test -> 400 Bad Request
    res_reuse = client.post(
        "/api/v1/liveness/validate",
        json={
            "capture_id": capture_id,
            "challenge_id": challenge_id,
            "nonce": secret_nonce
        },
        headers=headers
    )
    assert res_reuse.status_code == 400
    assert "already been used" in res_reuse.json()["detail"]


def test_invalid_and_unauthorized_challenge_errors(client, user_token):
    headers = {"Authorization": f"Bearer {user_token}"}
    wav_bytes = generate_wav_bytes(duration_sec=2.0)

    # Record capture
    res_rec = client.post(
        "/api/v1/audio/record",
        files={"file": ("live_mic.wav", wav_bytes, "audio/wav")},
        headers=headers
    )
    capture_id = res_rec.json()["capture_id"]

    # Create valid challenge
    res_ch = client.post("/api/v1/liveness/challenge", headers=headers)
    ch_data = res_ch.json()
    challenge_id = ch_data["challenge_id"]
    secret_nonce = ch_data["nonce"]

    # 1. Non-existent challenge ID -> 400 Bad Request
    res_fake = client.post(
        "/api/v1/liveness/validate",
        json={
            "capture_id": capture_id,
            "challenge_id": "CH-2026-999999",
            "nonce": secret_nonce
        },
        headers=headers
    )
    assert res_fake.status_code == 400
    assert "not found" in res_fake.json()["detail"].lower()

    # 2. Wrong secret nonce -> 400 Bad Request
    res_wrong_nonce = client.post(
        "/api/v1/liveness/validate",
        json={
            "capture_id": capture_id,
            "challenge_id": challenge_id,
            "nonce": "00000000000000000000000000000000"
        },
        headers=headers
    )
    assert res_wrong_nonce.status_code == 400
    assert "invalid secret nonce" in res_wrong_nonce.json()["detail"].lower()
