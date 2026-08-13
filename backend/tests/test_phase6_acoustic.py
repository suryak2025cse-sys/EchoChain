import io
import wave
import numpy as np
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
        "email": "phase6_tester@echochain.org",
        "password": "Password123!",
        "full_name": "Phase 6 Audio DSP Tester",
        "role": "PRODUCER",
        "organization": "Acoustic Intelligence Lab"
    })
    return reg.json()["access_token"]


def generate_tone_wav_bytes(frequency=440.0, duration_sec=2.5, sample_rate=22050):
    """Generate a clean synthetic WAV audio sample for testing signal processing."""
    t = np.linspace(0, duration_sec, int(sample_rate * duration_sec), False)
    # Sine tone with gentle envelope
    sine = 0.5 * np.sin(2 * np.pi * frequency * t)
    audio_int16 = (sine * 32767).astype(np.int16)

    buf = io.BytesIO()
    with wave.open(buf, "wb") as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(sample_rate)
        wav_file.writeframes(audio_int16.tobytes())
    buf.seek(0)
    return buf.read()


def test_phase6_dsp_feature_extraction_flow(client, user_token):
    headers = {"Authorization": f"Bearer {user_token}"}

    # 1. Create two distinct environmental audio samples (Sample A: 440 Hz, Sample B: 880 Hz)
    wav_a = generate_tone_wav_bytes(frequency=440.0, duration_sec=2.5)
    wav_b = generate_tone_wav_bytes(frequency=880.0, duration_sec=2.5)

    res_upload_a = client.post(
        "/api/v1/audio/upload",
        files={"file": ("sample_440hz.wav", wav_a, "audio/wav")},
        headers=headers
    )
    assert res_upload_a.status_code == 201
    cap_id_a = res_upload_a.json()["capture_id"]

    res_upload_b = client.post(
        "/api/v1/audio/upload",
        files={"file": ("sample_880hz.wav", wav_b, "audio/wav")},
        headers=headers
    )
    assert res_upload_b.status_code == 201
    cap_id_b = res_upload_b.json()["capture_id"]

    # 2. Trigger Acoustic Analysis for Sample A (/api/v1/acoustic/analyze/{capture_id})
    res_analyze_a = client.post(f"/api/v1/acoustic/analyze/{cap_id_a}", headers=headers)
    assert res_analyze_a.status_code == 200
    fp_a = res_analyze_a.json()

    assert fp_a["capture_id"] == cap_id_a
    assert "fingerprint" in fp_a and len(fp_a["fingerprint"]) == 64  # SHA-256 hash length
    assert fp_a["signal_label"] == "Acoustic similarity signal"
    assert fp_a["algorithm_version"] == "ECHO-DSP-v1.0"

    # Verify extracted feature summary metrics
    features_a = fp_a["feature_vector"]
    assert "mfcc_means" in features_a and len(features_a["mfcc_means"]) == 13
    assert "spectral_centroid_mean" in features_a
    assert "spectral_bandwidth_mean" in features_a
    assert "spectral_contrast_mean" in features_a
    assert "zero_crossing_rate_mean" in features_a
    assert "chroma_means" in features_a and len(features_a["chroma_means"]) == 12

    # Verify pre-rendered base64 visualization plots
    assert fp_a["waveform_plot_b64"].startswith("data:image/png;base64,")
    assert fp_a["melspectrogram_plot_b64"].startswith("data:image/png;base64,")
    assert fp_a["mfcc_plot_b64"].startswith("data:image/png;base64,")

    # 3. Trigger Acoustic Analysis for Sample B
    res_analyze_b = client.post(f"/api/v1/acoustic/analyze/{cap_id_b}", headers=headers)
    assert res_analyze_b.status_code == 200
    fp_b = res_analyze_b.json()

    # 4. Confirm distinct acoustic fingerprints generated for different audio frequencies
    assert fp_a["fingerprint"] != fp_b["fingerprint"]
    assert fp_a["feature_vector"]["spectral_centroid_mean"] != fp_b["feature_vector"]["spectral_centroid_mean"]

    # 5. Fetch Acoustic Fingerprint via GET (/api/v1/acoustic/fingerprint/{capture_id})
    res_get_a = client.get(f"/api/v1/acoustic/fingerprint/{cap_id_a}", headers=headers)
    assert res_get_a.status_code == 200
    assert res_get_a.json()["fingerprint"] == fp_a["fingerprint"]
