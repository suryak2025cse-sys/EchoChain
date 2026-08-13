from sqlalchemy import Column, String, Text, ForeignKey, Integer, DateTime, JSON
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class AcousticFingerprint(BaseModel):
    __tablename__ = "acoustic_fingerprints"

    capture_id = Column(String(100), ForeignKey("audio_captures.capture_id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    fingerprint = Column(String(255), nullable=False, index=True)  # SHA-256 commitment hash
    fingerprint_hex_vector = Column(Text, nullable=False)  # Binary/Hex acoustic fingerprint representation

    # Store full numerical feature summary dictionary
    feature_vector = Column(JSON, nullable=False)

    algorithm_version = Column(String(50), default="ECHO-DSP-v1.0", nullable=False)
    signal_label = Column(String(100), default="Acoustic similarity signal", nullable=False)

    # Base64 pre-rendered PNG visualizations (Waveform, Mel Spectrogram, MFCC)
    waveform_plot_b64 = Column(Text, nullable=True)
    melspectrogram_plot_b64 = Column(Text, nullable=True)
    mfcc_plot_b64 = Column(Text, nullable=True)

    # Relationship
    audio_capture = relationship("AudioCapture", backref="acoustic_fingerprint")
