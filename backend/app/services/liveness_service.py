import hashlib
import numpy as np
import librosa
from datetime import datetime, timezone
from typing import Optional, Tuple, Dict, Any
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.audio_capture import AudioCapture
from app.models.liveness_challenge import LivenessChallenge
from app.models.liveness_result import LivenessResult
from app.repositories.audio_capture_repository import audio_capture_repository
from app.repositories.liveness_repository import liveness_challenge_repository, liveness_result_repository
from app.repositories.audit_log_repository import audit_log_repository
from app.services.storage_service import storage_driver
from app.services.dsp_pipeline import AcousticDSPPipeline
from app.schemas.liveness import (
    LivenessChallengeResponse,
    LivenessValidationRequest,
    LivenessResultResponse
)


class LivenessService:
    @staticmethod
    def create_challenge(db: Session, current_user: User) -> LivenessChallengeResponse:
        challenge, secret_nonce = liveness_challenge_repository.generate_challenge(
            db,
            user_id=current_user.id,
            expires_in_sec=30
        )
        return LivenessChallengeResponse(
            challenge_id=challenge.challenge_id,
            nonce=secret_nonce,
            created_at=challenge.created_at,
            expires_at=challenge.expires_at,
            expires_in_seconds=30,
            status=challenge.status
        )

    @staticmethod
    def analyze_replay_risk(file_bytes: bytes) -> Tuple[float, str, str, Dict[str, Any]]:
        """
        Perform real DSP replay risk analysis on audio file bytes.
        Analyzes amplitude clipping, high-frequency rolloff, noise floor SNR, and spectral flatness.
        """
        y, sr = AcousticDSPPipeline.load_and_preprocess(file_bytes, target_sr=22050)

        if len(y) == 0:
            return 0.0, "CRITICAL", "REPLAY_SUSPECTED", {"error": "Empty audio"}

        # 1. Clipping / Saturation Ratio
        clipping_samples = np.sum(np.abs(y) >= 0.98)
        clipping_ratio = round(float(clipping_samples / len(y)), 4)

        # 2. High-Frequency Rolloff (Energy above 4 kHz vs total energy)
        S_mel = librosa.feature.melspectrogram(y=y, sr=sr, n_mels=128)
        freqs = librosa.mel_frequencies(n_mels=128, fmin=0, fmax=sr/2)
        high_freq_idx = np.where(freqs >= 4000)[0]
        
        total_energy = np.sum(S_mel) + 1e-9
        high_freq_energy = np.sum(S_mel[high_freq_idx, :])
        high_freq_rolloff_ratio = round(float(high_freq_energy / total_energy), 4)

        # 3. Spectral Flatness (Noisiness vs tonal balance)
        flatness = librosa.feature.spectral_flatness(y=y)
        spectral_flatness_mean = round(float(np.mean(flatness)), 4)

        # 4. Estimated Signal-to-Noise Ratio (SNR dB)
        rms = librosa.feature.rms(y=y)[0]
        signal_power = np.mean(rms**2) + 1e-9
        noise_floor = np.percentile(rms, 10)**2 + 1e-9
        snr_db = round(float(10 * np.log10(signal_power / noise_floor)), 2)

        # Compute penalties based on actual DSP metrics
        penalties = 0.0

        # Clipping penalty (re-recordings often clip)
        if clipping_ratio > 0.05:
            penalties += min(35.0, clipping_ratio * 200.0)

        # High Frequency loss penalty (speaker playback drops > 4kHz frequencies)
        if high_freq_rolloff_ratio < 0.02:
            penalties += 25.0
        elif high_freq_rolloff_ratio < 0.05:
            penalties += 12.0

        # Unnatural noise floor / SNR penalty
        if snr_db < 5.0:
            penalties += 20.0

        # Extreme flatness (synthetic white noise)
        if spectral_flatness_mean > 0.4:
            penalties += 15.0

        liveness_score = round(max(5.0, min(99.0, 95.0 - penalties)), 1)

        # Determine Replay Risk and Status
        if liveness_score >= 80.0:
            replay_risk = "LOW"
            status_label = "LIKELY_LIVE" if liveness_score < 90.0 else "LIVE"
        elif liveness_score >= 60.0:
            replay_risk = "MEDIUM"
            status_label = "LIKELY_LIVE"
        elif liveness_score >= 40.0:
            replay_risk = "HIGH"
            status_label = "SUSPICIOUS"
        else:
            replay_risk = "CRITICAL"
            status_label = "REPLAY_SUSPECTED"

        metadata = {
            "clipping_ratio": clipping_ratio,
            "high_freq_rolloff_ratio": high_freq_rolloff_ratio,
            "noise_floor_snr_db": snr_db,
            "spectral_flatness_mean": spectral_flatness_mean,
            "duration_sec": round(float(len(y)/sr), 2)
        }

        return liveness_score, replay_risk, status_label, metadata

    @staticmethod
    def validate_liveness(
        db: Session,
        current_user: User,
        req: LivenessValidationRequest
    ) -> LivenessResultResponse:
        # 1. Challenge lookup
        challenge = liveness_challenge_repository.get_by_challenge_id(db, req.challenge_id)
        if not challenge:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Challenge '{req.challenge_id}' not found."
            )

        # 2. Check challenge status
        if challenge.status == "USED":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Challenge '{req.challenge_id}' has already been used."
            )

        if challenge.status == "EXPIRED":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Challenge '{req.challenge_id}' has expired."
            )

        # 3. Check expiration timestamp against server-side time
        now_utc = datetime.now(timezone.utc)
        challenge_exp = challenge.expires_at
        if challenge_exp.tzinfo is None:
            challenge_exp = challenge_exp.replace(tzinfo=timezone.utc)

        # Convert both to timestamp float for fail-safe comparison
        if now_utc.timestamp() > challenge_exp.timestamp():
            challenge.status = "EXPIRED"
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Challenge '{req.challenge_id}' expired. 30-second capture window exceeded."
            )

        # 4. Nonce hash verification
        submitted_hash = hashlib.sha256(req.nonce.encode("utf-8")).hexdigest()
        if submitted_hash != challenge.nonce_hash:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid secret nonce provided for challenge verification."
            )

        # 5. Capture lookup
        capture = audio_capture_repository.get_by_capture_id(db, req.capture_id)
        if not capture:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Audio capture '{req.capture_id}' not found."
            )

        # Mark challenge as USED
        liveness_challenge_repository.mark_used(db, req.challenge_id)

        # 6. Run Replay Risk DSP Analysis on audio bytes
        file_bytes = storage_driver.get_file_bytes(capture.file_path)
        liveness_score, replay_risk, status_label, analysis_meta = LivenessService.analyze_replay_risk(file_bytes)

        # 7. Store LivenessResult
        existing = liveness_result_repository.get_by_capture_id(db, req.capture_id)
        if existing:
            existing.challenge_id = req.challenge_id
            existing.liveness_score = liveness_score
            existing.replay_risk = replay_risk
            existing.status = status_label
            existing.analysis_metadata = analysis_meta
            db.commit()
            db.refresh(existing)
            res_obj = existing
        else:
            res_obj = liveness_result_repository.create(
                db,
                obj_in_data={
                    "capture_id": req.capture_id,
                    "challenge_id": req.challenge_id,
                    "liveness_score": liveness_score,
                    "replay_risk": replay_risk,
                    "status": status_label,
                    "analysis_metadata": analysis_meta
                }
            )

        audit_log_repository.log(
            db,
            action="LIVENESS_VALIDATED",
            user_id=current_user.id,
            details=f"Validated liveness for capture {req.capture_id} (Score: {liveness_score}%, Status: {status_label})"
        )

        return LivenessResultResponse.model_validate(res_obj)

    @staticmethod
    def get_result(db: Session, capture_id: str, current_user: User) -> LivenessResultResponse:
        res = liveness_result_repository.get_by_capture_id(db, capture_id)
        if not res:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Liveness result for capture '{capture_id}' not found."
            )
        return LivenessResultResponse.model_validate(res)
