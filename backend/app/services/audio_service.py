import os
import io
import wave
import uuid
import struct
from datetime import datetime
from typing import Optional, List, Tuple
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.product import Product
from app.models.audio_recording import AudioRecording
from app.repositories.product_repository import product_repository
from app.repositories.audio_repository import audio_repository
from app.repositories.audit_log_repository import audit_log_repository
from app.services.storage_service import storage_driver
from app.schemas.audio import AudioRecordingResponse, AudioMetadataExtraction

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


class AudioService:
    @staticmethod
    def extract_audio_metadata(file_bytes: bytes, filename: str, mime_type: str) -> AudioMetadataExtraction:
        """Extract duration, sample rate, channels, and file size from audio file bytes."""
        file_size = len(file_bytes)
        duration = 30.0  # default estimate
        sample_rate = 44100
        channels = 1

        ext = os.path.splitext(filename)[1].lower()

        # Try parsing WAV header directly using standard library wave module
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
                pass
        else:
            # For MP3/M4A/WebM client records, estimate duration based on file size if not standard WAV
            # Avg bitrate estimate 128 kbps = 16000 bytes/sec
            estimated = file_size / 16000.0
            duration = max(5.0, min(120.0, round(estimated, 2)))

        return AudioMetadataExtraction(
            duration=duration,
            sample_rate=sample_rate,
            channels=channels,
            file_size=file_size,
            mime_type=mime_type
        )

    @staticmethod
    def upload_audio(
        db: Session,
        product_id: int,
        current_user: User,
        original_filename: str,
        file_bytes: bytes,
        content_type: str,
        client_duration: Optional[float] = None
    ) -> AudioRecordingResponse:
        # 1. Product ownership check
        product = product_repository.get(db, product_id)
        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")

        if product.producer_id != current_user.id and current_user.role.name != "ADMIN":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to upload audio for this product."
            )

        # 2. File size validation
        if len(file_bytes) > MAX_FILE_SIZE_BYTES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Audio file size exceeds maximum limit of 50 MB."
            )

        if len(file_bytes) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Audio file payload is empty."
            )

        # 3. Format & Extension Validation
        ext = os.path.splitext(original_filename)[1].lower()
        if not ext and content_type:
            if "wav" in content_type: ext = ".wav"
            elif "mpeg" in content_type or "mp3" in content_type: ext = ".mp3"
            elif "m4a" in content_type or "mp4" in content_type: ext = ".m4a"
            elif "webm" in content_type: ext = ".webm"
            elif "ogg" in content_type: ext = ".ogg"

        if ext not in ALLOWED_EXTENSIONS and content_type not in ALLOWED_MIME_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported audio format '{ext}'. Allowed formats: WAV, MP3, M4A, FLAC, OGG, WEBM."
            )

        # 4. Metadata extraction
        metadata = AudioService.extract_audio_metadata(file_bytes, original_filename, content_type)
        if client_duration and client_duration > 0:
            metadata.duration = round(client_duration, 2)

        # 5. Secure sanitized storage filename
        unique_filename = f"prod_{product_id}_{uuid.uuid4().hex[:12]}{ext or '.wav'}"
        file_path = storage_driver.save(file_bytes, unique_filename)

        # 6. Save DB record
        recording = audio_repository.create(
            db,
            obj_in_data={
                "product_id": product_id,
                "file_name": original_filename,
                "file_path": file_path,
                "mime_type": content_type or "audio/wav",
                "file_size": metadata.file_size,
                "duration": metadata.duration,
                "sample_rate": metadata.sample_rate,
                "channels": metadata.channels,
                "storage_status": "STORED_LOCAL",
                "processing_status": "UNPROCESSED",
            }
        )

        audit_log_repository.log(
            db,
            action="AUDIO_UPLOADED",
            user_id=current_user.id,
            details=f"Uploaded audio '{original_filename}' ({metadata.duration}s, {metadata.file_size} bytes) for product ID {product_id}"
        )

        return AudioRecordingResponse.model_validate(recording)

    @staticmethod
    def get_audio_recordings(db: Session, product_id: int, current_user: User) -> List[AudioRecordingResponse]:
        product = product_repository.get(db, product_id)
        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")

        recordings = audio_repository.get_by_product_id(db, product_id)
        return [AudioRecordingResponse.model_validate(r) for r in recordings]

    @staticmethod
    def get_audio_bytes(db: Session, product_id: int, recording_id: int, current_user: User) -> Tuple[bytes, str, str]:
        recording = audio_repository.get(db, recording_id)
        if not recording or recording.product_id != product_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Audio recording not found.")

        file_bytes = storage_driver.get_file_bytes(recording.file_path)
        return file_bytes, recording.mime_type, recording.file_name

    @staticmethod
    def process_audio(db: Session, product_id: int, recording_id: int, current_user: User) -> AudioRecordingResponse:
        recording = audio_repository.get(db, recording_id)
        if not recording or recording.product_id != product_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Audio recording not found.")

        product = product_repository.get(db, product_id)
        if product and product.producer_id != current_user.id and current_user.role.name != "ADMIN":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized.")

        recording.processing_status = "COMPLETED"
        db.commit()
        db.refresh(recording)

        audit_log_repository.log(
            db,
            action="AUDIO_PROCESSED",
            user_id=current_user.id,
            details=f"Processed audio recording ID {recording_id} for product ID {product_id}"
        )

        return AudioRecordingResponse.model_validate(recording)

    @staticmethod
    def delete_audio(db: Session, product_id: int, recording_id: int, current_user: User):
        recording = audio_repository.get(db, recording_id)
        if not recording or recording.product_id != product_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Audio recording not found.")

        product = product_repository.get(db, product_id)
        if product and product.producer_id != current_user.id and current_user.role.name != "ADMIN":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized.")

        # Delete physical file from storage
        storage_driver.delete(recording.file_path)
        
        # Delete DB record
        db.delete(recording)
        db.commit()

        audit_log_repository.log(
            db,
            action="AUDIO_DELETED",
            user_id=current_user.id,
            details=f"Deleted audio recording ID {recording_id}"
        )
