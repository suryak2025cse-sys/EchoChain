from sqlalchemy import Column, String, Integer, Float, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class LivenessResult(BaseModel):
    __tablename__ = "liveness_results"

    capture_id = Column(String(100), ForeignKey("audio_captures.capture_id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    challenge_id = Column(String(100), ForeignKey("liveness_challenges.challenge_id", ondelete="SET NULL"), nullable=True, index=True)

    liveness_score = Column(Float, nullable=False)  # 0 to 100 percentage
    replay_risk = Column(String(50), nullable=False)  # LOW, MEDIUM, HIGH, CRITICAL
    status = Column(String(50), nullable=False, index=True)  # LIVE, LIKELY_LIVE, SUSPICIOUS, REPLAY_SUSPECTED

    # Detail metrics (clipping_ratio, high_freq_rolloff, noise_floor_snr, spectral_flatness)
    analysis_metadata = Column(JSON, nullable=False)

    # Relationships
    audio_capture = relationship("AudioCapture", backref="liveness_result")
    challenge = relationship("LivenessChallenge", backref="liveness_results")
