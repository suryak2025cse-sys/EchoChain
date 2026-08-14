from sqlalchemy import Column, String, Text, ForeignKey, Integer, JSON, DateTime
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class SecurityEvent(BaseModel):
    __tablename__ = "security_events"

    event_id = Column(String(100), unique=True, nullable=False, index=True)  # SEC-2026-000001
    event_type = Column(String(100), nullable=False, index=True)
    # Risk Levels: LOW, MEDIUM, HIGH, CRITICAL
    risk_level = Column(String(20), nullable=False, index=True)

    provenance_id = Column(String(100), nullable=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="SET NULL"), nullable=True, index=True)
    capture_id = Column(String(100), nullable=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)

    detector_name = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    evidence_json = Column(JSON, nullable=False)

    # Status: OPEN, INVESTIGATING, RESOLVED, FALSE_POSITIVE
    status = Column(String(50), default="OPEN", nullable=False, index=True)
    resolved_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    resolution_notes = Column(Text, nullable=True)

    # Relationships
    user = relationship("User", foreign_keys=[user_id], backref="security_events")
    resolved_by = relationship("User", foreign_keys=[resolved_by_id], backref="resolved_security_events")
    product = relationship("Product", foreign_keys=[product_id], backref="security_events")
