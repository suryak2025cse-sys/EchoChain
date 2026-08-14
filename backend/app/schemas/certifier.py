from typing import List, Optional, Any, Dict
from datetime import datetime
from pydantic import BaseModel, Field


class CertifierDecisionRequest(BaseModel):
    decision: str = Field(..., description="Certification decision: APPROVE, REJECT, or FLAG")
    reason: str = Field(..., min_length=3, description="Audit rationale or compliance notes for the decision")


class CertifierDecisionResponse(BaseModel):
    provenance_id: str
    previous_status: str
    new_status: str
    decision: str
    certifier_id: int
    certifier_email: str
    certifier_role: str
    reason: str
    decided_at: datetime
    audit_log_id: int
    message: str


class AuditLogResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    action: str
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    details: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class AuditLogListResponse(BaseModel):
    items: List[AuditLogResponse]
    total: int


class CertifierReviewDetailResponse(BaseModel):
    provenance_id: str
    status: str
    is_sealed: bool
    sealed_at: Optional[datetime] = None
    provenance_hash: str
    canonical_payload: Optional[Any] = None
    hash_verification_status: str
    
    # 1. Product & Terroir
    product: Dict[str, Any]
    
    # 2. Audio Evidence
    audio_capture: Dict[str, Any]
    
    # 3. Acoustic Fingerprint
    acoustic_fingerprint: Dict[str, Any]
    
    # 4. Liveness & Replay Risk
    liveness_evidence: Dict[str, Any]
    
    # 5. IPFS Metadata
    ipfs_metadata: Optional[Dict[str, Any]] = None
    
    # 6. Polygon Blockchain Anchor
    polygon_anchor: Optional[Dict[str, Any]] = None
    
    # 7. Immutable Audit History Trail
    audit_trail: List[AuditLogResponse]
