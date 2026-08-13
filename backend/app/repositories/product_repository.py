from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from app.models.product import Product
from app.repositories.base_repository import BaseRepository


class ProductRepository(BaseRepository[Product]):
    def __init__(self):
        super().__init__(Product)

    def get_by_batch_id(self, db: Session, batch_id: str) -> Optional[Product]:
        return db.query(Product).filter(Product.batch_id == batch_id).first()

    def get_multi_filtered(
        self,
        db: Session,
        *,
        producer_id: Optional[int] = None,
        search: Optional[str] = None,
        product_type: Optional[str] = None,
        verification_status: Optional[str] = None,
        skip: int = 0,
        limit: int = 10
    ) -> Tuple[List[Product], int]:
        query = db.query(Product)

        if producer_id is not None:
            query = query.filter(Product.producer_id == producer_id)

        if search:
            search_term = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    Product.product_name.ilike(search_term),
                    Product.brand.ilike(search_term),
                    Product.region.ilike(search_term),
                    Product.country.ilike(search_term),
                    Product.batch_id.ilike(search_term),
                )
            )

        if product_type:
            query = query.filter(Product.product_type == product_type)

        if verification_status:
            query = query.filter(Product.verification_status == verification_status)

        total = query.count()
        items = query.order_by(Product.created_at.desc()).offset(skip).limit(limit).all()

        return items, total

    def get_producer_stats(self, db: Session, producer_id: Optional[int] = None) -> dict:
        query = db.query(Product)
        if producer_id is not None:
            query = query.filter(Product.producer_id == producer_id)

        total_products = query.count()
        registered_batches = db.query(func.count(Product.batch_id)).filter(
            Product.producer_id == producer_id if producer_id else True
        ).scalar() or 0

        verified_products = query.filter(Product.verification_status == "VERIFIED").count()
        pending_verification = query.filter(Product.verification_status == "PENDING").count()
        flagged_products = query.filter(Product.verification_status == "FLAGGED").count()

        return {
            "total_products": total_products,
            "registered_batches": registered_batches,
            "verified_products": verified_products,
            "pending_verification": pending_verification,
            "flagged_products": flagged_products,
        }


product_repository = ProductRepository()
