from typing import Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, Response, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_active_user
from app.models.user import User
from app.services.audio_capture_service import AudioCaptureService
from app.schemas.audio_capture import AudioCaptureResponse, AudioCaptureListResponse
from app.schemas.user import MessageResponse

router = APIRouter(prefix="/audio", tags=["Phase 5 — Software Audio Capture"])


@router.post("/upload", response_model=AudioCaptureResponse, status_code=status.HTTP_201_CREATED, summary="Upload Audio File")
async def upload_audio_capture(
    file: UploadFile = File(...),
    product_id: Optional[int] = Form(None),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    file_bytes = await file.read()
    return AudioCaptureService.upload_audio(
        db,
        current_user=current_user,
        filename=file.filename or "environmental_evidence.wav",
        file_bytes=file_bytes,
        mime_type=file.content_type or "audio/wav",
        product_id=product_id
    )


@router.post("/record", response_model=AudioCaptureResponse, status_code=status.HTTP_201_CREATED, summary="Save Browser Recorded Audio")
async def record_audio_capture(
    file: UploadFile = File(...),
    duration: Optional[float] = Form(None),
    product_id: Optional[int] = Form(None),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    file_bytes = await file.read()
    return AudioCaptureService.record_audio(
        db,
        current_user=current_user,
        filename=file.filename or "browser_mic_record.wav",
        file_bytes=file_bytes,
        mime_type=file.content_type or "audio/wav",
        client_duration=duration,
        product_id=product_id
    )


@router.get("", response_model=AudioCaptureListResponse, summary="List Current User's Audio Captures")
def list_audio_captures(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return AudioCaptureService.list_captures(db, current_user)


@router.get("/{capture_id}", response_model=AudioCaptureResponse, summary="Get Capture Metadata by Capture ID")
def get_audio_capture(
    capture_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return AudioCaptureService.get_capture(db, capture_id, current_user)


@router.get("/{capture_id}/stream", summary="Stream Raw Capture Audio")
def stream_audio_capture(
    capture_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    file_bytes, mime_type, filename = AudioCaptureService.get_capture_stream(db, capture_id, current_user)
    return Response(
        content=file_bytes,
        media_type=mime_type,
        headers={"Content-Disposition": f"inline; filename={filename}"}
    )


@router.delete("/{capture_id}", response_model=MessageResponse, summary="Delete Audio Capture")
def delete_audio_capture(
    capture_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    AudioCaptureService.delete_capture(db, capture_id, current_user)
    return MessageResponse(message=f"Audio capture {capture_id} deleted successfully.")
