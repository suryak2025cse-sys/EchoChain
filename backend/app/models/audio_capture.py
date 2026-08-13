from sqlalchemy import Column, String, Text, ForeignKey, Integer, Float, DateTime
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class AudioCapture(BaseModel):
    __tablename__ = "audio_captures"

    capture_id = Column(String(100), unique=True, nullable=False, index=True)  # ECH-CAP-2026-000001
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="SET NULL"), nullable=True, index=True)

    file_name = Column(String(255), nullable=False)
    file_path = Column(Text, nullable=False)
    mime_type = Column(String(100), nullable=False)
    file_size = Column(Integer, nullable=False)  # in bytes

    duration = Column(Float, nullable=False, default=0.0)  # in seconds
    sample_rate = Column(Integer, nullable=False, default=44100)  # in Hz
    channels = Column(Integer, nullable=False, default=1)  # mono/stereo

    evidence_label = Column(String(100), default="Environmental audio evidence", nullable=False)
    capture_source = Column(String(50), default="BROWSER_MIC", nullable=False)  # BROWSER_MIC or FILE_UPLOAD

    # Relationships
    user = relationship("User", backref="audio_captures")
    product = relationship("Product", backref="audio_captures")
