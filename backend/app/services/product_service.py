import math
import secrets
from datetime import date, datetime, timezone, timedelta
from typing import Optional, Dict, Any
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.product import Product
from app.models.provenance_record import ProvenanceRecord
from app.repositories.product_repository import product_repository
from app.repositories.provenance_repository import provenance_repository
from app.repositories.audit_log_repository import audit_log_repository
from app.services.qr_service import QRService
from app.schemas.product import (
    ProductCreateRequest,
    ProductUpdateRequest,
    ProductPublicResponse,
    ProductProtectedResponse,
    PaginatedProductResponse,
    ProducerStatsResponse,
    PublicVerificationResponse
)


class ProductService:
    @staticmethod
    def generate_batch_id() -> str:
        """Generate unique batch identifier."""
        return f"ECH-BATCH-{secrets.token_hex(4).upper()}"

    @staticmethod
    def create_product(db: Session, current_user: User, req: ProductCreateRequest) -> ProductProtectedResponse:
        try:
            batch_id = ProductService.generate_batch_id()
            while product_repository.get_by_batch_id(db, batch_id):
                batch_id = ProductService.generate_batch_id()

            count = db.query(Product).count() + 1
            echochain_product_id = QRService.generate_product_id(req.product_type, count)
            
            # QR Code points to public consumer verification URL
            verification_url = f"{QRService.DEFAULT_FRONTEND_BASE_URL}/verify/{echochain_product_id}"
            qr_b64 = QRService.generate_qr_b64(verification_url)

            new_product = product_repository.create(
                db,
                obj_in_data={
                    "producer_id": current_user.id,
                    "product_name": req.product_name,
                    "product_type": req.product_type,
                    "brand": req.brand,
                    "batch_id": batch_id,
                    "echochain_product_id": echochain_product_id,
                    "qr_code_b64": qr_b64,
                    "region": req.region,
                    "country": req.country,
                    "protected_gps_latitude": req.protected_gps_latitude,
                    "protected_gps_longitude": req.protected_gps_longitude,
                    "harvest_date": req.harvest_date,
                    "description": req.description,
                    "certification_status": req.certification_status,
                    "verification_status": "PENDING",
                }
            )

            audit_log_repository.log(
                db,
                action="PRODUCT_CREATED",
                user_id=current_user.id,
                details=f"Created product '{new_product.product_name}' (ID: {echochain_product_id}, Batch: {batch_id})"
            )

            return ProductProtectedResponse.model_validate(new_product)
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to create product batch: {str(e)}"
            )

    @staticmethod
    def update_product(
        db: Session,
        product_id: int,
        current_user: User,
        req: ProductUpdateRequest
    ) -> ProductProtectedResponse:
        product = product_repository.get(db, product_id)
        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")

        if product.producer_id != current_user.id and current_user.role.name != "ADMIN":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to edit this product."
            )

        update_data = req.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(product, key, value)

        db.commit()
        db.refresh(product)

        audit_log_repository.log(
            db,
            action="PRODUCT_UPDATED",
            user_id=current_user.id,
            details=f"Updated product ID {product.id} ({product.product_name})"
        )

        return ProductProtectedResponse.model_validate(product)

    @staticmethod
    def delete_product(db: Session, product_id: int, current_user: User):
        product = product_repository.get(db, product_id)
        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")

        if product.producer_id != current_user.id and current_user.role.name != "ADMIN":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to delete this product."
            )

        db.delete(product)
        db.commit()

        audit_log_repository.log(
            db,
            action="PRODUCT_DELETED",
            user_id=current_user.id,
            details=f"Deleted product ID {product_id}"
        )

    @staticmethod
    def get_product(db: Session, product_id: int, current_user: Optional[User] = None) -> ProductProtectedResponse:
        product = product_repository.get(db, product_id)
        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")

        if current_user and (current_user.id == product.producer_id or (current_user.role and current_user.role.name == "ADMIN")):
            return ProductProtectedResponse.model_validate(product)
        
        return ProductPublicResponse.model_validate(product)

    @staticmethod
    def get_public_verification_payload(db: Session, identifier: str) -> PublicVerificationResponse:
        """
        Public Consumer Verification Query (Scanned via Product QR Code).
        Exposes ONLY safe verification data:
        - Product, Region, Harvest period, Verification status
        - Acoustic evidence, Cryptographic proof, Blockchain proof
        NEVER exposes exact GPS or private user PII.
        """
        # Lookup by echochain_product_id (e.g. ECH-COFFEE-2026-0001), batch_id, or integer ID
        product = None
        if identifier.startswith("ECH-") and "2026" in identifier:
            product = db.query(Product).filter(Product.echochain_product_id == identifier).first()
        if not product and identifier.startswith("ECH-BATCH-"):
            product = product_repository.get_by_batch_id(db, identifier)
        if not product and identifier.isdigit():
            product = product_repository.get(db, int(identifier))
        if not product:
            product = db.query(Product).filter(Product.echochain_product_id == identifier).first()

        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with identifier '{identifier}' not found."
            )

        # Generate echochain_product_id and QR code if missing
        if not product.echochain_product_id:
            product.echochain_product_id = QRService.generate_product_id(product.product_type, product.id)
            verification_url = f"{QRService.DEFAULT_FRONTEND_BASE_URL}/verify/{product.echochain_product_id}"
            product.qr_code_b64 = QRService.generate_qr_b64(verification_url)
            db.commit()
            db.refresh(product)

        # Lookup associated Provenance Record
        prov = db.query(ProvenanceRecord).filter(ProvenanceRecord.product_id == product.id).order_by(ProvenanceRecord.id.desc()).first()

        acoustic_evidence = None
        cryptographic_proof = None
        blockchain_proof = None
        ipfs_storage = None

        if prov:
            acoustic_evidence = {
                "capture_id": prov.capture_id,
                "fingerprint": prov.fingerprint,
                "liveness_score": prov.liveness_score,
                "replay_risk": prov.replay_risk,
                "liveness_status": prov.liveness_status,
                "audio_stream_url": f"/api/v1/audio/stream/{prov.capture_id}"
            }
            cryptographic_proof = {
                "provenance_id": prov.provenance_id,
                "provenance_hash": prov.provenance_hash,
                "status": prov.status,
                "is_sealed": prov.is_sealed,
                "sealed_at": prov.sealed_at.isoformat() if prov.sealed_at else None
            }
            if prov.is_anchored or prov.tx_hash:
                blockchain_proof = {
                    "network": prov.network or "Polygon Amoy Testnet",
                    "contract_address": prov.contract_address or "0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7",
                    "tx_hash": prov.tx_hash,
                    "block_number": prov.block_number,
                    "anchored_at": prov.anchored_at.isoformat() if prov.anchored_at else None,
                    "is_onchain_valid": True
                }
            if prov.ipfs_cid:
                ipfs_storage = {
                    "ipfs_cid": prov.ipfs_cid,
                    "ipfs_gateway_url": prov.ipfs_url or f"https://gateway.pinata.cloud/ipfs/{prov.ipfs_cid}"
                }

        now = datetime.now(timezone.utc)

        return PublicVerificationResponse(
            echochain_product_id=product.echochain_product_id,
            product_id=product.id,
            product_name=product.product_name,
            product_type=product.product_type,
            brand=product.brand,
            batch_id=product.batch_id,
            region=product.region,
            country=product.country,
            harvest_date=product.harvest_date,
            description=product.description,
            certification_status=product.certification_status,
            verification_status="VERIFIED" if (prov and (prov.is_sealed or prov.is_anchored)) else product.verification_status,
            qr_code_b64=product.qr_code_b64,
            acoustic_evidence=acoustic_evidence,
            cryptographic_proof=cryptographic_proof,
            blockchain_proof=blockchain_proof,
            ipfs_storage=ipfs_storage,
            verified_at=now
        )

    @staticmethod
    def list_products(
        db: Session,
        current_user: Optional[User] = None,
        producer_only: bool = False,
        search: Optional[str] = None,
        product_type: Optional[str] = None,
        verification_status: Optional[str] = None,
        page: int = 1,
        limit: int = 10
    ) -> PaginatedProductResponse:
        skip = (page - 1) * limit
        producer_id = None
        
        if producer_only and current_user:
            producer_id = current_user.id

        items, total = product_repository.get_multi_filtered(
            db,
            producer_id=producer_id,
            search=search,
            product_type=product_type,
            verification_status=verification_status,
            skip=skip,
            limit=limit
        )

        pages = math.ceil(total / limit) if total > 0 else 1
        public_items = [ProductPublicResponse.model_validate(item) for item in items]

        return PaginatedProductResponse(
            items=public_items,
            total=total,
            page=page,
            limit=limit,
            pages=pages
        )

    @staticmethod
    def get_stats(db: Session, current_user: User) -> ProducerStatsResponse:
        producer_id = current_user.id if current_user.role.name == "PRODUCER" else None
        stats = product_repository.get_producer_stats(db, producer_id)
        return ProducerStatsResponse(**stats)
