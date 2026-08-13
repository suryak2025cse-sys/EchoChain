from sqlalchemy import Column, String, Text, ForeignKey, Integer, Float, DateTime, Date
from sqlalchemy.orm import relationship
import datetime
from app.models.base import BaseModel


class Product(BaseModel):
    __tablename__ = "products"

    producer_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    product_name = Column(String(255), nullable=False, index=True)
    product_type = Column(String(100), nullable=False, index=True)  # Specialty Coffee, Organic Tea, Wine, Cocoa, etc.
    brand = Column(String(100), nullable=False)
    batch_id = Column(String(100), unique=True, nullable=False, index=True)

    # Phase 12 — Unique EchoChain Product ID & QR Code
    echochain_product_id = Column(String(100), unique=True, nullable=True, index=True)  # ECH-COFFEE-2026-0001
    qr_code_b64 = Column(Text, nullable=True)

    # Public location info
    region = Column(String(255), nullable=False, index=True)
    country = Column(String(100), nullable=False, index=True)

    # Protected exact GPS coordinates (never exposed publicly)
    protected_gps_latitude = Column(Float, nullable=True)
    protected_gps_longitude = Column(Float, nullable=True)

    harvest_date = Column(Date, nullable=False, default=datetime.date.today)
    description = Column(Text, nullable=True)

    certification_status = Column(String(100), default="Pending Review", nullable=False)  # Certified Organic, Fair Trade, Pending Review, Uncertified
    verification_status = Column(String(50), default="UNVERIFIED", nullable=False, index=True)  # UNVERIFIED, PENDING, VERIFIED, FLAGGED

    # Relationship
    producer = relationship("User", backref="products")
