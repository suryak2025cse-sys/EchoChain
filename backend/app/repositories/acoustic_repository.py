from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.acoustic_fingerprint import AcousticFingerprint
from app.repositories.base_repository import BaseRepository


class AcousticRepository(BaseRepository[AcousticFingerprint]):
    def __init__(self):
        super().__init__(AcousticFingerprint)

    def get_by_capture_id(self, db: Session, capture_id: str) -> Optional[AcousticFingerprint]:
        return db.query(AcousticFingerprint).filter(AcousticFingerprint.capture_id == capture_id).first()

    def get_by_fingerprint_hash(self, db: Session, fingerprint: str) -> Optional[AcousticFingerprint]:
        return db.query(AcousticFingerprint).filter(AcousticFingerprint.fingerprint == fingerprint).first()


acoustic_repository = AcousticRepository()
