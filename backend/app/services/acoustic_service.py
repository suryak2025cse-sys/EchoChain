from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.audio_capture import AudioCapture
from app.models.acoustic_fingerprint import AcousticFingerprint
from app.repositories.audio_capture_repository import audio_capture_repository
from app.repositories.acoustic_repository import acoustic_repository
from app.repositories.audit_log_repository import audit_log_repository
from app.services.storage_service import storage_driver
from app.services.dsp_pipeline import AcousticDSPPipeline
from app.schemas.acoustic import AcousticFingerprintResponse, AcousticFingerprintListResponse


class AcousticService:
    @staticmethod
    def analyze_capture(db: Session, capture_id: str, current_user: User) -> AcousticFingerprintResponse:
        # 1. Retrieve audio capture
        capture = audio_capture_repository.get_by_capture_id(db, capture_id)
        if not capture:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Audio capture '{capture_id}' not found.")

        # 2. Get file bytes from storage
        file_bytes = storage_driver.get_file_bytes(capture.file_path)

        # 3. DSP Pipeline: Load, Normalize, Resample, Trim Silence
        y, sr = AcousticDSPPipeline.load_and_preprocess(file_bytes)

        # 4. Feature Extraction & Fingerprint Calculation
        result = AcousticDSPPipeline.extract_features(y, sr)

        # 5. Render Plots
        waveform_b64, melspec_b64, mfcc_b64 = AcousticDSPPipeline.render_plots_b64(result["raw"])

        # 6. Save or update AcousticFingerprint DB record
        existing = acoustic_repository.get_by_capture_id(db, capture_id)
        if existing:
            existing.fingerprint = result["fingerprint"]
            existing.fingerprint_hex_vector = result["fingerprint_hex_vector"]
            existing.feature_vector = result["feature_summary"]
            existing.waveform_plot_b64 = waveform_b64
            existing.melspectrogram_plot_b64 = melspec_b64
            existing.mfcc_plot_b64 = mfcc_b64
            db.commit()
            db.refresh(existing)
            fp_record = existing
        else:
            fp_record = acoustic_repository.create(
                db,
                obj_in_data={
                    "capture_id": capture_id,
                    "fingerprint": result["fingerprint"],
                    "fingerprint_hex_vector": result["fingerprint_hex_vector"],
                    "feature_vector": result["feature_summary"],
                    "algorithm_version": AcousticDSPPipeline.ALGORITHM_VERSION,
                    "signal_label": AcousticDSPPipeline.SIGNAL_LABEL,
                    "waveform_plot_b64": waveform_b64,
                    "melspectrogram_plot_b64": melspec_b64,
                    "mfcc_plot_b64": mfcc_b64
                }
            )

        audit_log_repository.log(
            db,
            action="ACOUSTIC_ANALYSIS_COMPLETED",
            user_id=current_user.id,
            details=f"Extracted acoustic fingerprint for capture {capture_id} (Fingerprint Hash: {result['fingerprint'][:12]}...)"
        )

        return AcousticFingerprintResponse.model_validate(fp_record)

    @staticmethod
    def get_fingerprint(db: Session, capture_id: str, current_user: User) -> AcousticFingerprintResponse:
        fp_record = acoustic_repository.get_by_capture_id(db, capture_id)
        if not fp_record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Acoustic fingerprint for capture '{capture_id}' not found. Run POST /api/acoustic/analyze/{capture_id} first."
            )
        return AcousticFingerprintResponse.model_validate(fp_record)

    @staticmethod
    def list_fingerprints(db: Session, current_user: User) -> AcousticFingerprintListResponse:
        records = db.query(AcousticFingerprint).order_by(AcousticFingerprint.created_at.desc()).all()
        items = [AcousticFingerprintResponse.model_validate(r) for r in records]
        return AcousticFingerprintListResponse(items=items, total=len(items))
