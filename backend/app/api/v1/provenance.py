from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_active_user
from app.models.user import User
from app.schemas.provenance import (
    ProvenanceCreateRequest,
    ProvenanceRecordResponse,
    ProvenanceListResponse,
    ProvenanceSealResponse,
    ProvenanceVerificationResponse
)
from app.services.provenance_service import ProvenanceService

router = APIRouter(prefix="/provenance", tags=["Provenance Engine & Cryptographic Commitment"])


@router.post("", response_model=ProvenanceRecordResponse, status_code=status.HTTP_201_CREATED)
def create_provenance(
    req: ProvenanceCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Assemble a tamper-evident Provenance Record by aggregating product origin,
    environmental audio capture, acoustic fingerprint hash commitment, and software liveness verification.
    """
    return ProvenanceService.create_provenance(db, current_user, req)


@router.post("/{identifier}/seal", response_model=ProvenanceSealResponse)
def seal_provenance(
    identifier: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Cryptographically seal a provenance record with an immutable deterministic SHA-256 hash commitment.
    """
    return ProvenanceService.seal_provenance(db, identifier, current_user)


@router.post("/verify/{identifier}", response_model=ProvenanceVerificationResponse)
@router.get("/verify/{identifier}", response_model=ProvenanceVerificationResponse)
def verify_provenance(
    identifier: str,
    db: Session = Depends(get_db)
):
    """
    Verify cryptographic SHA-256 integrity of a provenance record.
    Re-computes canonical digest and returns VALID or TAMPERED.
    """
    return ProvenanceService.verify_provenance(db, identifier)


@router.get("/{identifier}", response_model=ProvenanceRecordResponse)
def get_provenance(
    identifier: str,
    db: Session = Depends(get_db)
):
    """
    Retrieve public provenance details by provenance_id (e.g. ECH-PROV-2026-000001) or database integer ID.
    """
    return ProvenanceService.get_provenance(db, identifier)


@router.get("", response_model=ProvenanceListResponse)
def list_provenance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    List provenance records for the current producer or administrator.
    """
    return ProvenanceService.list_provenance(db, current_user)
