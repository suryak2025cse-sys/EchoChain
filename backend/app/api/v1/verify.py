from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.product import PublicVerificationResponse
from app.services.product_service import ProductService

router = APIRouter(prefix="/verify", tags=["Public Consumer Verification"])


@router.get("/{identifier}", response_model=PublicVerificationResponse)
@router.get("/product/{identifier}", response_model=PublicVerificationResponse)
def verify_public_product(
    identifier: str,
    db: Session = Depends(get_db)
):
    """
    Public Consumer Product Verification Endpoint (Scanned via Product QR Code).
    Returns ONLY safe verification info: Product, Region, Harvest Period, Verification Status,
    Acoustic Evidence, Cryptographic Proof, Blockchain Proof, IPFS Storage.
    Never exposes exact GPS coordinates or private user PII.
    """
    return ProductService.get_public_verification_payload(db, identifier)
