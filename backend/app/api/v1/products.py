from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_active_user, get_optional_current_user
from app.models.user import User
from app.schemas.product import (
    ProductCreateRequest,
    ProductUpdateRequest,
    ProductPublicResponse,
    ProductProtectedResponse,
    PaginatedProductResponse,
    ProducerStatsResponse,
    PublicVerificationResponse
)
from app.services.product_service import ProductService
from app.services.qr_service import QRService

router = APIRouter(prefix="/products", tags=["Product Management & Verification QR"])


@router.post("", response_model=ProductProtectedResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    req: ProductCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Register a new product batch with unique EchoChain product ID and QR code."""
    return ProductService.create_product(db, current_user, req)


@router.get("/stats", response_model=ProducerStatsResponse)
def get_producer_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Retrieve dashboard statistics for the logged-in producer or admin."""
    return ProductService.get_stats(db, current_user)


@router.get("", response_model=PaginatedProductResponse)
def list_products(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
    producer_only: bool = Query(False, description="Filter products owned by current user"),
    search: Optional[str] = Query(None, description="Search by name, brand, or batch ID"),
    product_type: Optional[str] = Query(None, description="Filter by product category"),
    verification_status: Optional[str] = Query(None, description="Filter by verification state"),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100)
):
    """List registered product batches with filtering and pagination."""
    return ProductService.list_products(
        db,
        current_user=current_user,
        producer_only=producer_only,
        search=search,
        product_type=product_type,
        verification_status=verification_status,
        page=page,
        limit=limit
    )


@router.get("/{product_id}/qr")
def get_product_qr_code(
    product_id: int,
    db: Session = Depends(get_db)
):
    """Retrieves the Base64/SVG QR Code for physical packaging verification."""
    product = ProductService.get_product(db, product_id)
    verification_url = f"{QRService.DEFAULT_FRONTEND_BASE_URL}/verify/{product.echochain_product_id or product.batch_id}"
    qr_b64 = QRService.generate_qr_b64(verification_url)
    return {
        "echochain_product_id": product.echochain_product_id,
        "verification_url": verification_url,
        "qr_code_b64": qr_b64
    }


@router.get("/{product_id}", response_model=ProductProtectedResponse)
def get_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """Retrieve specific product batch details."""
    return ProductService.get_product(db, product_id, current_user)


@router.put("/{product_id}", response_model=ProductProtectedResponse)
def update_product(
    product_id: int,
    req: ProductUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update product batch metadata (Producer/Admin only)."""
    return ProductService.update_product(db, product_id, current_user, req)


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete product batch (Producer/Admin only)."""
    ProductService.delete_product(db, product_id, current_user)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
