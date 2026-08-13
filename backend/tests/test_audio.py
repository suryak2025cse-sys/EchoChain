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
def producer_data(client):
    reg = client.post("/api/v1/auth/register", json={
        "email": "audio_prod@echochain.org",
        "password": "Password123!",
        "full_name": "Audio Producer",
        "role": "PRODUCER",
        "organization": "Acoustic Estate"
    })
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create product
    prod_res = client.post("/api/v1/products", json={
        "product_name": "Highland Audio Blend",
        "product_type": "Specialty Coffee",
        "brand": "Acoustic Estate",
        "region": "Sidama",
        "country": "Ethiopia",
        "harvest_date": "2026-08-01",
        "certification_status": "Certified Organic"
    }, headers=headers)
    
    product_id = prod_res.json()["id"]
    return {"token": token, "headers": headers, "product_id": product_id}


def create_dummy_wav_bytes(duration_sec=2.0, sample_rate=44100):
    """Utility helper generating valid 16-bit PCM WAV audio bytes."""
    buf = io.BytesIO()
    num_frames = int(duration_sec * sample_rate)
    with wave.open(buf, "wb") as wav_file:
        wav_file.setnchannels(1)  # Mono
        wav_file.setsampwidth(2)  # 16-bit
        wav_file.setframerate(sample_rate)
        # Write silent PCM frames
        wav_file.writeframes(b"\x00\x00" * num_frames)
    buf.seek(0)
    return buf.read()


def test_audio_upload_list_process_delete_flow(client, producer_data):
    headers = producer_data["headers"]
    product_id = producer_data["product_id"]

    wav_bytes = create_dummy_wav_bytes(duration_sec=3.5, sample_rate=44100)

    # 1. Upload Audio
    res_upload = client.post(
        f"/api/v1/products/{product_id}/audio/upload",
        files={"file": ("field_ambient_harvest.wav", wav_bytes, "audio/wav")},
        data={"duration": "3.5"},
        headers=headers
    )
    assert res_upload.status_code == 201
    audio_data = res_upload.json()
    recording_id = audio_data["id"]
    assert audio_data["file_name"] == "field_ambient_harvest.wav"
    assert audio_data["mime_type"] == "audio/wav"
    assert audio_data["duration"] == 3.5
    assert audio_data["storage_status"] == "STORED_LOCAL"
    assert audio_data["processing_status"] == "UNPROCESSED"

    # 2. List Audio Recordings
    res_list = client.get(f"/api/v1/products/{product_id}/audio", headers=headers)
    assert res_list.status_code == 200
    list_items = res_list.json()
    assert len(list_items) >= 1
    assert any(item["id"] == recording_id for item in list_items)

    # 3. Stream/Download Audio File
    res_stream = client.get(f"/api/v1/products/{product_id}/audio/{recording_id}/download", headers=headers)
    assert res_stream.status_code == 200
    assert len(res_stream.content) == len(wav_bytes)

    # 4. Process Audio
    res_proc = client.post(f"/api/v1/products/{product_id}/audio/{recording_id}/process", headers=headers)
    assert res_proc.status_code == 200
    assert res_proc.json()["processing_status"] == "COMPLETED"

    # 5. Delete Audio
    res_del = client.delete(f"/api/v1/products/{product_id}/audio/{recording_id}", headers=headers)
    assert res_del.status_code == 200

    # 6. Verify Deletion
    res_list_after = client.get(f"/api/v1/products/{product_id}/audio", headers=headers)
    assert not any(item["id"] == recording_id for item in res_list_after.json())
