from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_active_user
from app.models.user import User
from app.services.liveness_service import LivenessService
from app.schemas.liveness import (
    LivenessChallengeResponse,
    LivenessValidationRequest,
    LivenessResultResponse
)

router = APIRouter(prefix="/liveness", tags=["Phase 7 — Software Audio Liveness & Replay Detection"])


@router.post("/challenge", response_model=LivenessChallengeResponse, status_code=status.HTTP_201_CREATED, summary="Create Capture Challenge")
def create_liveness_challenge(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return LivenessService.create_challenge(db, current_user)


@router.post("/validate", response_model=LivenessResultResponse, summary="Validate Challenge & Run Replay Risk Analysis")
def validate_liveness_challenge(
    req: LivenessValidationRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return LivenessService.validate_liveness(db, current_user, req)


@router.get("/{capture_id}", response_model=LivenessResultResponse, summary="Get Liveness Results for Capture")
def get_liveness_result(
    capture_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return LivenessService.get_result(db, capture_id, current_user)
