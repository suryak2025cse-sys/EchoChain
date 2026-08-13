from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class ProvenanceCreateRequest(BaseModel):
    product_id: int
    capture_id: str


class ProvenanceRecordResponse(BaseModel):
    id: int
    provenance_id: str = Field(..., example="ECH-PROV-2026-000001")
    product_id: int
    batch_id: str
    capture_id: str
    producer_id: int
    region: str
    country: str
    fingerprint: str
    liveness_score: float
    replay_risk: str
    liveness_status: str
    status: str = Field(..., example="READY_FOR_SEAL")
    provenance_hash: str = Field(..., example="7f3a9b2c...")
    metadata_json: Dict[str, Any]
    is_sealed: bool = False
    sealed_at: Optional[datetime] = None
    ipfs_cid: Optional[str] = None
    ipfs_url: Optional[str] = None
    tx_hash: Optional[str] = None
    block_number: Optional[int] = None
    network: Optional[str] = None
    contract_address: Optional[str] = None
    is_anchored: bool = False
    anchored_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ProvenanceListResponse(BaseModel):
    items: List[ProvenanceRecordResponse]
    total: int


class ProvenanceSealResponse(BaseModel):
    provenance_id: str
    provenance_hash: str
    status: str = Field(..., example="SEALED")
    is_sealed: bool = True
    sealed_at: datetime
    message: str = "Provenance record sealed with deterministic SHA-256 commitment hash."


class ProvenanceVerificationResponse(BaseModel):
    provenance_id: str
    stored_hash: str
    computed_hash: str
    status: str = Field(..., example="VALID")  # VALID or TAMPERED
    is_tamper_evident: bool
    verified_at: datetime
    canonical_payload: Dict[str, Any]
