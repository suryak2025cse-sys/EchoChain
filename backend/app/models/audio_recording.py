from sqlalchemy import Column, String, Text, ForeignKey, Integer, Float, DateTime
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class AudioRecording(BaseModel):
    __tablename__ = "audio_recordings"

    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    file_name = Column(String(255), nullable=False)
    file_path = Column(Text, nullable=False)
    mime_type = Column(String(100), nullable=False)
    file_size = Column(Integer, nullable=False)  # size in bytes

    duration = Column(Float, nullable=False, default=0.0)  # duration in seconds
    sample_rate = Column(Integer, nullable=False, default=44100)  # sample rate in Hz
    channels = Column(Integer, nullable=False, default=1)  # mono (1) or stereo (2)

    storage_status = Column(String(50), default="STORED_LOCAL", nullable=False)  # STORED_LOCAL, PINNED_IPFS, STORED_S3
    processing_status = Column(String(50), default="UNPROCESSED", nullable=False, index=True)  # UNPROCESSED, PROCESSING, COMPLETED, FAILED

    # Relationship
    product = relationship("Product", backref="audio_recordings")
