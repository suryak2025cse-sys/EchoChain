import io
import wave
import pytest
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def user_token(client):
    reg = client.post("/api/v1/auth/register", json={
        "email": "phase5_user@echochain.org",
        "password": "Password123!",
        "full_name": "Phase 5 Tester",
        "role": "PRODUCER",
        "organization": "Bio-Acoustics Lab"
    })
    return reg.json()["access_token"]


def create_wav_sample(duration_sec=3.0, sample_rate=44100):
    buf = io.BytesIO()
    num_frames = int(duration_sec * sample_rate)
    with wave.open(buf, "wb") as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(sample_rate)
        wav_file.writeframes(b"\x00\x00" * num_frames)
    buf.seek(0)
    return buf.read()


def test_phase5_audio_capture_flow(client, user_token):
    headers = {"Authorization": f"Bearer {user_token}"}
    wav_bytes = create_wav_sample(duration_sec=4.0, sample_rate=44100)

    # 1. Upload Audio File (/api/v1/audio/upload)
    res_upload = client.post(
        "/api/v1/audio/upload",
        files={"file": ("field_recording.wav", wav_bytes, "audio/wav")},
        headers=headers
    )
    assert res_upload.status_code == 201
    cap1 = res_upload.json()
    assert cap1["capture_id"].startswith("ECH-CAP-2026-")
    assert cap1["evidence_label"] == "Environmental audio evidence"
    assert cap1["capture_source"] == "FILE_UPLOAD"
    assert cap1["duration"] == 4.0
    capture_id_1 = cap1["capture_id"]

    # 2. Record Browser Audio (/api/v1/audio/record)
    res_record = client.post(
        "/api/v1/audio/record",
        files={"file": ("browser_mic.wav", wav_bytes, "audio/wav")},
        data={"duration": "4.5"},
        headers=headers
    )
    assert res_record.status_code == 201
    cap2 = res_record.json()
    assert cap2["capture_id"].startswith("ECH-CAP-2026-")
    assert cap2["capture_source"] == "BROWSER_MIC"
    assert cap2["duration"] == 4.5
    capture_id_2 = cap2["capture_id"]

    # 3. Get Capture Metadata (/api/v1/audio/{capture_id})
    res_get = client.get(f"/api/v1/audio/{capture_id_1}", headers=headers)
    assert res_get.status_code == 200
    assert res_get.json()["capture_id"] == capture_id_1

    # 4. Stream Raw Audio (/api/v1/audio/{capture_id}/stream)
    res_stream = client.get(f"/api/v1/audio/{capture_id_1}/stream", headers=headers)
    assert res_stream.status_code == 200
    assert len(res_stream.content) == len(wav_bytes)

    # 5. Delete Capture (/api/v1/audio/{capture_id})
    res_del = client.delete(f"/api/v1/audio/{capture_id_1}", headers=headers)
    assert res_del.status_code == 200

    # 6. Verify Deletion
    res_get_del = client.get(f"/api/v1/audio/{capture_id_1}", headers=headers)
    assert res_get_del.status_code == 404

    # 7. Corrupted/Empty Audio Validation Check (0 bytes)
    res_empty = client.post(
        "/api/v1/audio/upload",
        files={"file": ("empty.wav", b"", "audio/wav")},
        headers=headers
    )
    assert res_empty.status_code == 400
    assert "Empty or corrupted" in res_empty.json()["detail"]
