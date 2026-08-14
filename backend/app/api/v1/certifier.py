from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_active_user, require_roles
from app.models.user import User
from app.services.certifier_service import CertifierService
from app.services.provenance_service import ProvenanceService
from app.schemas.provenance import ProvenanceListResponse
from app.schemas.certifier import (
    CertifierDecisionRequest,
    CertifierDecisionResponse,
    CertifierReviewDetailResponse,
    AuditLogListResponse
)

router = APIRouter(prefix="/certifier", tags=["Certifier & Auditor Governance"])


@router.get(
    "/provenance",
    response_model=ProvenanceListResponse,
    summary="List Provenance Queue for Certifier Review",
    dependencies=[Depends(require_roles(["CERTIFIER", "REGULATOR", "ADMIN"]))]
)
def list_provenance_queue(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Returns all provenance records in the system for certifier/auditor inspection.
    """
    return ProvenanceService.list_provenance(db, current_user)


@router.get(
    "/provenance/{identifier}",
    response_model=CertifierReviewDetailResponse,
    summary="Review Comprehensive Provenance Evidence",
    dependencies=[Depends(require_roles(["CERTIFIER", "REGULATOR", "ADMIN"]))]
)
def review_provenance_evidence(
    identifier: str,
    db: Session = Depends(get_db)
):
    """
    Returns full 7-proof inspection data (Acoustic fingerprint, Liveness score, Replay risk,
    SHA-256 hash, IPFS CID, Polygon blockchain anchor, and immutable audit trail).
    """
    return CertifierService.get_review_detail(db, identifier)


@router.post(
    "/decide/{identifier}",
    response_model=CertifierDecisionResponse,
    summary="Execute Certifier Decision (Approve, Reject, Flag)",
    dependencies=[Depends(require_roles(["CERTIFIER", "REGULATOR", "ADMIN"]))]
)
def decide_provenance(
    identifier: str,
    req: CertifierDecisionRequest,
    request: Request,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Approve, Reject, or Flag a provenance record.
    Immutably appends an entry to the audit log recording certifier identity, timestamp, decision, and rationale.
    """
    client_ip = request.client.host if request.client else "127.0.0.1"
    return CertifierService.execute_decision(db, identifier, current_user, req, ip_address=client_ip)


@router.get(
    "/audit-logs",
    response_model=AuditLogListResponse,
    summary="List Immutable System Audit History Logs",
    dependencies=[Depends(require_roles(["CERTIFIER", "REGULATOR", "ADMIN"]))]
)
def list_audit_logs(
    limit: int = Query(50, ge=1, le=500),
    db: Session = Depends(get_db)
):
    """
    Returns system-wide immutable audit trail history entries.
    """
    return CertifierService.list_audit_logs(db, limit)
