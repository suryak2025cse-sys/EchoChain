from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_active_user, require_roles
from app.models.user import User
from app.services.security_service import SecurityService
from app.repositories.security_event_repository import security_event_repository
from app.schemas.security import (
    SecurityEventResponse,
    SecurityEventListResponse,
    SecurityEventResolveRequest,
    SecurityMetricsSummary,
    SecurityScanResult
)

router = APIRouter(prefix="/security", tags=["Security & Fraud Detection"])


@router.get(
    "/events",
    response_model=SecurityEventListResponse,
    summary="List System Security Threat Events",
    dependencies=[Depends(require_roles(["ADMIN", "CERTIFIER", "REGULATOR"]))]
)
def list_security_events(
    risk_level: Optional[str] = Query(None, description="Filter by risk level (LOW, MEDIUM, HIGH, CRITICAL)"),
    event_type: Optional[str] = Query(None, description="Filter by event type"),
    status: Optional[str] = Query(None, description="Filter by status (OPEN, INVESTIGATING, RESOLVED, FALSE_POSITIVE)"),
    limit: int = Query(50, ge=1, le=500),
    skip: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """
    Returns filterable list of security & fraud detection events.
    """
    items = security_event_repository.list_filtered(
        db, risk_level=risk_level, event_type=event_type, status=status, limit=limit, skip=skip
    )
    total = security_event_repository.count_filtered(
        db, risk_level=risk_level, event_type=event_type, status=status
    )
    return SecurityEventListResponse(
        items=[SecurityEventResponse.model_validate(i) for i in items],
        total=total
    )


@router.get(
    "/events/{event_id}",
    response_model=SecurityEventResponse,
    summary="Get Security Event Details",
    dependencies=[Depends(require_roles(["ADMIN", "CERTIFIER", "REGULATOR"]))]
)
def get_security_event_detail(
    event_id: str,
    db: Session = Depends(get_db)
):
    """
    Returns full technical indicators and evidence JSON for a security threat event.
    """
    ev = security_event_repository.get_by_event_id(db, event_id)
    if not ev:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Security event '{event_id}' not found."
        )
    return SecurityEventResponse.model_validate(ev)


@router.post(
    "/scan",
    response_model=SecurityScanResult,
    summary="Trigger Automated System Fraud & Security Audit Scan",
    dependencies=[Depends(require_roles(["ADMIN", "CERTIFIER", "REGULATOR"]))]
)
def run_security_scan(
    db: Session = Depends(get_db)
):
    """
    Evaluates all system provenance records, captures, and liveness challenges against security rules.
    Auto-detects duplicates, replayed audio, hash mismatches, metadata drift, and invalid blockchain proofs.
    """
    return SecurityService.run_full_security_audit(db)


@router.post(
    "/events/{event_id}/resolve",
    response_model=SecurityEventResponse,
    summary="Resolve or Flag False-Positive Security Event",
    dependencies=[Depends(require_roles(["ADMIN", "CERTIFIER", "REGULATOR"]))]
)
def resolve_security_event(
    event_id: str,
    req: SecurityEventResolveRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Updates the resolution status of a security event (RESOLVED, FALSE_POSITIVE, INVESTIGATING).
    """
    return SecurityService.resolve_event(
        db,
        event_id=event_id,
        current_user=current_user,
        target_status=req.status,
        resolution_notes=req.resolution_notes
    )


@router.get(
    "/metrics",
    response_model=SecurityMetricsSummary,
    summary="Get Security & Fraud Metrics Dashboard Summary",
    dependencies=[Depends(require_roles(["ADMIN", "CERTIFIER", "REGULATOR"]))]
)
def get_security_metrics(
    db: Session = Depends(get_db)
):
    """
    Returns aggregated metrics by risk level, status, and event type.
    """
    return SecurityService.get_security_metrics(db)
