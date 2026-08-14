from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, ConfigDict


class SecurityEventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    event_id: str
    event_type: str
    risk_level: str  # LOW, MEDIUM, HIGH, CRITICAL
    provenance_id: Optional[str] = None
    product_id: Optional[int] = None
    capture_id: Optional[str] = None
    user_id: Optional[int] = None
    detector_name: str
    description: str
    evidence_json: Dict[str, Any]
    status: str  # OPEN, INVESTIGATING, RESOLVED, FALSE_POSITIVE
    resolved_by_id: Optional[int] = None
    resolved_at: Optional[datetime] = None
    resolution_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class SecurityEventListResponse(BaseModel):
    items: List[SecurityEventResponse]
    total: int


class SecurityEventResolveRequest(BaseModel):
    status: str  # RESOLVED, FALSE_POSITIVE, INVESTIGATING
    resolution_notes: str


class SecurityMetricsSummary(BaseModel):
    total_events: int
    open_events: int
    resolved_events: int
    false_positives: int
    by_risk_level: Dict[str, int]  # {"LOW": x, "MEDIUM": y, "HIGH": z, "CRITICAL": w}
    by_event_type: Dict[str, int]


class SecurityScanResult(BaseModel):
    scanned_records: int
    scanned_captures: int
    scanned_challenges: int
    events_generated: int
    new_events: List[SecurityEventResponse]
    summary_message: str
