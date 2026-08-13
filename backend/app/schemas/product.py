from datetime import date, datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class ProductCreateRequest(BaseModel):
    product_name: str = Field(..., min_length=2, max_length=255)
    product_type: str = Field(..., min_length=2, max_length=100)
    brand: str = Field(..., min_length=2, max_length=100)
    region: str = Field(..., min_length=2, max_length=255)
    country: str = Field(..., min_length=2, max_length=100)
    harvest_date: date
    description: Optional[str] = None
    certification_status: str = "Pending Review"
    
    # Optional protected GPS coordinates (never returned in public APIs)
    protected_gps_latitude: Optional[float] = None
    protected_gps_longitude: Optional[float] = None


class ProductUpdateRequest(BaseModel):
    product_name: Optional[str] = Field(None, min_length=2, max_length=255)
    product_type: Optional[str] = Field(None, min_length=2, max_length=100)
    brand: Optional[str] = Field(None, min_length=2, max_length=100)
    region: Optional[str] = Field(None, min_length=2, max_length=255)
    country: Optional[str] = Field(None, min_length=2, max_length=100)
    harvest_date: Optional[date] = None
    description: Optional[str] = None
    certification_status: Optional[str] = None
    verification_status: Optional[str] = None
    protected_gps_latitude: Optional[float] = None
    protected_gps_longitude: Optional[float] = None


class ProductPublicResponse(BaseModel):
    """Public product payload - exact GPS is strictly omitted to preserve privacy."""
    id: int
    producer_id: int
    product_name: str
    product_type: str
    brand: str
    batch_id: str
    echochain_product_id: Optional[str] = None
    qr_code_b64: Optional[str] = None
    region: str
    country: str
    harvest_date: date
    description: Optional[str] = None
    certification_status: str
    verification_status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProductProtectedResponse(ProductPublicResponse):
    """Producer/Admin payload - includes optional protected GPS coordinates."""
    protected_gps_latitude: Optional[float] = None
    protected_gps_longitude: Optional[float] = None


class PaginatedProductResponse(BaseModel):
    items: List[ProductPublicResponse]
    total: int
    page: int
    limit: int
    pages: int


class ProducerStatsResponse(BaseModel):
    total_products: int
    registered_batches: int
    verified_products: int
    pending_verification: int
    flagged_products: int


class PublicVerificationResponse(BaseModel):
    """
    Public Consumer Verification Payload.
    Strictly exposes safe data: Product, Region, Harvest period, Verification status, Acoustic evidence, Cryptographic proof, Blockchain proof.
    Never exposes exact GPS or private user information.
    """
    echochain_product_id: str
    product_id: int
    product_name: str
    product_type: str
    brand: str
    batch_id: str
    region: str
    country: str
    harvest_date: date
    description: Optional[str] = None
    certification_status: str
    verification_status: str
    qr_code_b64: Optional[str] = None
    
    # Safe proof layers
    acoustic_evidence: Optional[Dict[str, Any]] = None
    cryptographic_proof: Optional[Dict[str, Any]] = None
    blockchain_proof: Optional[Dict[str, Any]] = None
    ipfs_storage: Optional[Dict[str, Any]] = None
    verified_at: datetime
