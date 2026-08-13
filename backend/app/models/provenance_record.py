from sqlalchemy import Column, String, Integer, Float, Boolean, ForeignKey, JSON, DateTime
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class ProvenanceRecord(BaseModel):
    __tablename__ = "provenance_records"

    provenance_id = Column(String(100), unique=True, nullable=False, index=True)  # ECH-PROV-2026-000001
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    batch_id = Column(String(100), ForeignKey("products.batch_id", ondelete="CASCADE"), nullable=False, index=True)
    capture_id = Column(String(100), ForeignKey("audio_captures.capture_id", ondelete="CASCADE"), nullable=False, index=True)
    producer_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Region-level origin ONLY (Never store exact GPS in public/provenance record)
    region = Column(String(255), nullable=False)
    country = Column(String(100), nullable=False)

    fingerprint = Column(String(255), nullable=False, index=True)
    liveness_score = Column(Float, nullable=False)
    replay_risk = Column(String(50), nullable=False)
    liveness_status = Column(String(50), nullable=False)

    # Lifecycle state: DRAFT, AUDIO_CAPTURED, ACOUSTIC_ANALYZED, LIVENESS_VERIFIED, READY_FOR_SEAL, SEALED, ANCHORED
    status = Column(String(50), default="DRAFT", nullable=False, index=True)

    # Immutable SHA-256 Hash of assembled canonical provenance metadata
    provenance_hash = Column(String(255), nullable=False, index=True)
    metadata_json = Column(JSON, nullable=False)

    # Sealing status
    is_sealed = Column(Boolean, default=False, nullable=False)
    sealed_at = Column(DateTime, nullable=True)

    # Phase 10 — Decentralized IPFS Storage
    ipfs_cid = Column(String(255), nullable=True, index=True)
    ipfs_url = Column(String(500), nullable=True)

    # Phase 11 — Polygon Testnet Blockchain Anchoring
    tx_hash = Column(String(255), nullable=True, index=True)
    block_number = Column(Integer, nullable=True)
    network = Column(String(100), nullable=True)
    contract_address = Column(String(255), nullable=True)
    is_anchored = Column(Boolean, default=False, nullable=False)
    anchored_at = Column(DateTime, nullable=True)

    # Relationships
    product = relationship("Product", foreign_keys=[product_id], backref="provenance_records")
    audio_capture = relationship("AudioCapture", foreign_keys=[capture_id], backref="provenance_records")
    producer = relationship("User", foreign_keys=[producer_id], backref="provenance_records")
