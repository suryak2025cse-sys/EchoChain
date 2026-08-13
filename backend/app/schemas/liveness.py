from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field


class LivenessChallengeResponse(BaseModel):
    challenge_id: str = Field(..., example="CH-2026-000001")
    nonce: str = Field(..., description="Cryptographically secure secret nonce string")
    created_at: datetime
    expires_at: datetime
    expires_in_seconds: int = 30
    status: str = "ACTIVE"


class LivenessValidationRequest(BaseModel):
    capture_id: str
    challenge_id: str
    nonce: str


class LivenessResultResponse(BaseModel):
    id: int
    capture_id: str
    challenge_id: Optional[str] = None
    liveness_score: float = Field(..., example=87.5)
    replay_risk: str = Field(..., example="LOW")  # LOW, MEDIUM, HIGH, CRITICAL
    status: str = Field(..., example="LIKELY_LIVE")  # LIVE, LIKELY_LIVE, SUSPICIOUS, REPLAY_SUSPECTED
    analysis_metadata: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True
