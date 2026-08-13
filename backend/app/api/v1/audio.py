from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, Response, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_active_user, require_roles
from app.models.user import User
from app.services.audio_service import AudioService
from app.schemas.audio import AudioRecordingResponse, AudioProcessRequest
from app.schemas.user import MessageResponse

router = APIRouter(prefix="/products/{product_id}/audio", tags=["Audio Recording Management"])


@router.post("/upload", response_model=AudioRecordingResponse, status_code=status.HTTP_201_CREATED, summary="Upload Harvest Audio Signature")
async def upload_audio(
    product_id: int,
    file: UploadFile = File(...),
    duration: Optional[float] = Form(None),
    current_user: User = Depends(require_roles(["PRODUCER", "ADMIN"])),
    db: Session = Depends(get_db)
):
    file_bytes = await file.read()
    return AudioService.upload_audio(
        db,
        product_id=product_id,
        current_user=current_user,
        original_filename=file.filename or "recording.wav",
        file_bytes=file_bytes,
        content_type=file.content_type or "audio/wav",
        client_duration=duration
    )


@router.get("", response_model=List[AudioRecordingResponse], summary="List Audio Recordings for Product")
def list_audio_recordings(
    product_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return AudioService.get_audio_recordings(db, product_id, current_user)


@router.get("/{recording_id}/download", summary="Stream Raw Audio File")
def stream_audio(
    product_id: int,
    recording_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    file_bytes, mime_type, filename = AudioService.get_audio_bytes(db, product_id, recording_id, current_user)
    return Response(
        content=file_bytes,
        media_type=mime_type,
        headers={"Content-Disposition": f"inline; filename={filename}"}
    )


@router.post("/{recording_id}/process", response_model=AudioRecordingResponse, summary="Trigger Audio Signal Processing")
def process_audio(
    product_id: int,
    recording_id: int,
    req: AudioProcessRequest = AudioProcessRequest(),
    current_user: User = Depends(require_roles(["PRODUCER", "ADMIN"])),
    db: Session = Depends(get_db)
):
    return AudioService.process_audio(db, product_id, recording_id, current_user)


@router.delete("/{recording_id}", response_model=MessageResponse, summary="Delete Audio Recording")
def delete_audio(
    product_id: int,
    recording_id: int,
    current_user: User = Depends(require_roles(["PRODUCER", "ADMIN"])),
    db: Session = Depends(get_db)
):
    AudioService.delete_audio(db, product_id, recording_id, current_user)
    return MessageResponse(message=f"Audio recording {recording_id} deleted successfully.")
