from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.provenance_record import ProvenanceRecord
from app.repositories.base_repository import BaseRepository


class ProvenanceRepository(BaseRepository[ProvenanceRecord]):
    def __init__(self):
        super().__init__(ProvenanceRecord)

    def get_by_provenance_id(self, db: Session, provenance_id: str) -> Optional[ProvenanceRecord]:
        return db.query(ProvenanceRecord).filter(ProvenanceRecord.provenance_id == provenance_id).first()

    def get_by_capture_id(self, db: Session, capture_id: str) -> Optional[ProvenanceRecord]:
        return db.query(ProvenanceRecord).filter(ProvenanceRecord.capture_id == capture_id).first()

    def list_by_producer(self, db: Session, producer_id: int) -> List[ProvenanceRecord]:
        return db.query(ProvenanceRecord).filter(ProvenanceRecord.producer_id == producer_id).order_by(ProvenanceRecord.created_at.desc()).all()


provenance_repository = ProvenanceRepository()
