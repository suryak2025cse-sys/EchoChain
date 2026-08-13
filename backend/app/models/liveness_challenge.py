from sqlalchemy import Column, String, Integer, DateTime
from app.models.base import BaseModel


class LivenessChallenge(BaseModel):
    __tablename__ = "liveness_challenges"

    challenge_id = Column(String(100), unique=True, nullable=False, index=True)  # CH-2026-000001
    user_id = Column(Integer, nullable=False, index=True)
    nonce_hash = Column(String(255), nullable=False)  # SHA-256 hash of random secret nonce

    expires_at = Column(DateTime, nullable=False, index=True)
    used_at = Column(DateTime, nullable=True)

    status = Column(String(50), default="ACTIVE", nullable=False, index=True)  # ACTIVE, EXPIRED, USED
