import os
import io
import wave
from datetime import datetime
from typing import Optional, List, Tuple
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.audio_capture import AudioCapture
from app.repositories.audio_capture_repository import audio_capture_repository
from app.repositories.audit_log_repository import audit_log_repository
from app.services.storage_service import storage_driver
from app.schemas.audio_capture import AudioCaptureResponse, AudioCaptureListResponse

ALLOWED_EXTENSIONS = {".wav", ".mp3", ".m4a", ".ogg", ".flac", ".webm"}
ALLOWED_MIME_TYPES = {
    "audio/wav",
    "audio/x-wav",
    "audio/mp3",
    "audio/mpeg",
    "audio/m4a",
    "audio/x-m4a",
    "audio/mp4",
    "audio/ogg",
    "audio/flac",
    "audio/webm",
}
MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024  # 50 MB


class AudioCaptureService:
    @staticmethod
    def validate_audio_file(file_bytes: bytes, filename: str, mime_type: str) -> Tuple[float, int, int]:
        """Validate file size, format, corruption, and return (duration, sample_rate, channels)."""
        file_size = len(file_bytes)

        # 1. Empty audio payload check
        if file_size == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Empty or corrupted audio file payload (0 bytes received)."
            )

        # 2. File size limit check
        if file_size > MAX_FILE_SIZE_BYTES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Audio file size exceeds maximum limit of 50 MB."
            )

        # 3. Format extension & MIME check
        ext = os.path.splitext(filename)[1].lower()
        if not ext and mime_type:
            if "wav" in mime_type: ext = ".wav"
            elif "mpeg" in mime_type or "mp3" in mime_type: ext = ".mp3"
            elif "m4a" in mime_type or "mp4" in mime_type: ext = ".m4a"
            elif "webm" in mime_type: ext = ".webm"
            elif "ogg" in mime_type: ext = ".ogg"

        if ext not in ALLOWED_EXTENSIONS and mime_type not in ALLOWED_MIME_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported audio format '{ext}'. Allowed formats: WAV, MP3, M4A, FLAC, OGG, WEBM."
            )

        duration = 30.0
        sample_rate = 44100
        channels = 1

        # 4. Check WAV header if applicable
        if ext == ".wav" or "wav" in mime_type.lower():
            try:
                with wave.open(io.BytesIO(file_bytes), "rb") as wav_file:
                    frames = wav_file.getnframes()
                    rate = wav_file.getframerate()
                    channels = wav_file.getnchannels()
                    if rate > 0:
                        duration = round(frames / float(rate), 2)
                        sample_rate = rate
            except Exception:
                # If invalid wave structure
                if len(file_bytes) < 44:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Corrupted or invalid WAV header."
                    )
        else:
            # Estimate duration for compressed browser recording streams
            estimated = file_size / 16000.0
            duration = max(1.0, min(120.0, round(estimated, 2)))

        return duration, sample_rate, channels

    @staticmethod
    def upload_audio(
        db: Session,
        current_user: User,
        filename: str,
        file_bytes: bytes,
        mime_type: str,
        product_id: Optional[int] = None
    ) -> AudioCaptureResponse:
        duration, sample_rate, channels = AudioCaptureService.validate_audio_file(file_bytes, filename, mime_type)
        
        capture_id = audio_capture_repository.get_next_sequence_id(db)
        ext = os.path.splitext(filename)[1].lower() or ".wav"
        saved_filename = f"{capture_id}{ext}"
        
        file_path = storage_driver.save(file_bytes, saved_filename)

        capture = audio_capture_repository.create(
            db,
            obj_in_data={
                "capture_id": capture_id,
                "user_id": current_user.id,
                "product_id": product_id,
                "file_name": filename,
                "file_path": file_path,
                "mime_type": mime_type or "audio/wav",
                "file_size": len(file_bytes),
                "duration": duration,
                "sample_rate": sample_rate,
                "channels": channels,
                "evidence_label": "Environmental audio evidence",
                "capture_source": "FILE_UPLOAD"
            }
        )

        audit_log_repository.log(
            db,
            action="AUDIO_CAPTURE_UPLOADED",
            user_id=current_user.id,
            details=f"Uploaded audio evidence {capture_id} ({len(file_bytes)} bytes, {duration:.1f}s)"
        )

        try:
            from app.services.security_service import SecurityService
            SecurityService.evaluate_capture_security(db, capture_id, current_user.id)
        except Exception as e:
            logger.warning(f"Real-time security evaluation warning: {e}")

        return AudioCaptureResponse.model_validate(capture)

    @staticmethod
    def record_audio(
        db: Session,
        current_user: User,
        filename: str,
        file_bytes: bytes,
        mime_type: str,
        client_duration: Optional[float] = None,
        product_id: Optional[int] = None
    ) -> AudioCaptureResponse:
        duration, sample_rate, channels = AudioCaptureService.validate_audio_file(file_bytes, filename, mime_type)
        if client_duration and client_duration > 0:
            duration = round(client_duration, 2)

        capture_id = audio_capture_repository.get_next_sequence_id(db)
        ext = os.path.splitext(filename)[1].lower() or ".wav"
        saved_filename = f"{capture_id}{ext}"
        
        file_path = storage_driver.save(file_bytes, saved_filename)

        capture = audio_capture_repository.create(
            db,
            obj_in_data={
                "capture_id": capture_id,
                "user_id": current_user.id,
                "product_id": product_id,
                "file_name": filename,
                "file_path": file_path,
                "mime_type": mime_type or "audio/wav",
                "file_size": len(file_bytes),
                "duration": duration,
                "sample_rate": sample_rate,
                "channels": channels,
                "evidence_label": "Environmental audio evidence",
                "capture_source": "BROWSER_MIC"
            }
        )

        audit_log_repository.log(
            db,
            action="AUDIO_CAPTURE_RECORDED",
            user_id=current_user.id,
            details=f"Recorded audio capture {capture_id} ({duration}s)"
        )

        return AudioCaptureResponse.model_validate(capture)

    @staticmethod
    def get_capture(db: Session, capture_id: str, current_user: User) -> AudioCaptureResponse:
        capture = audio_capture_repository.get_by_capture_id(db, capture_id)
        if not capture:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Capture '{capture_id}' not found.")
        return AudioCaptureResponse.model_validate(capture)

    @staticmethod
    def get_capture_stream(db: Session, capture_id: str, current_user: User) -> Tuple[bytes, str, str]:
        capture = audio_capture_repository.get_by_capture_id(db, capture_id)
        if not capture:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Capture '{capture_id}' not found.")
        file_bytes = storage_driver.get_file_bytes(capture.file_path)
        return file_bytes, capture.mime_type, capture.file_name

    @staticmethod
    def delete_capture(db: Session, capture_id: str, current_user: User):
        capture = audio_capture_repository.get_by_capture_id(db, capture_id)
        if not capture:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Capture '{capture_id}' not found.")

        if capture.user_id != current_user.id and current_user.role.name != "ADMIN":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete capture.")

        storage_driver.delete(capture.file_path)
        db.delete(capture)
        db.commit()

        audit_log_repository.log(
            db,
            action="AUDIO_CAPTURE_DELETED",
            user_id=current_user.id,
            details=f"Deleted audio capture {capture_id}"
        )

    @staticmethod
    def list_captures(db: Session, current_user: User) -> AudioCaptureListResponse:
        items = audio_capture_repository.get_by_user_id(db, current_user.id)
        responses = [AudioCaptureResponse.model_validate(item) for item in items]
        return AudioCaptureListResponse(items=responses, total=len(responses))
