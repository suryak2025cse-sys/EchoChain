from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_active_user
from app.models.user import User
from app.services.acoustic_service import AcousticService
from app.schemas.acoustic import AcousticFingerprintResponse, AcousticFingerprintListResponse

router = APIRouter(prefix="/acoustic", tags=["Phase 6 — Acoustic Fingerprinting Pipeline"])


@router.post("/analyze/{capture_id}", response_model=AcousticFingerprintResponse, status_code=status.HTTP_200_OK, summary="Analyze Environmental Audio & Generate Fingerprint")
def analyze_acoustic_capture(
    capture_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return AcousticService.analyze_capture(db, capture_id, current_user)


@router.get("/fingerprint/{capture_id}", response_model=AcousticFingerprintResponse, summary="Get Acoustic Fingerprint & Visual Analysis")
def get_acoustic_fingerprint(
    capture_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return AcousticService.get_fingerprint(db, capture_id, current_user)


@router.get("", response_model=AcousticFingerprintListResponse, summary="List Acoustic Fingerprints")
def list_acoustic_fingerprints(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return AcousticService.list_fingerprints(db, current_user)
