from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.audio_capture import AudioCapture
from app.repositories.base_repository import BaseRepository


class AudioCaptureRepository(BaseRepository[AudioCapture]):
    def __init__(self):
        super().__init__(AudioCapture)

    def get_by_capture_id(self, db: Session, capture_id: str) -> Optional[AudioCapture]:
        return db.query(AudioCapture).filter(AudioCapture.capture_id == capture_id).first()

    def get_by_user_id(self, db: Session, user_id: int) -> List[AudioCapture]:
        return (
            db.query(AudioCapture)
            .filter(AudioCapture.user_id == user_id)
            .order_by(AudioCapture.created_at.desc())
            .all()
        )

    def get_next_sequence_id(self, db: Session) -> str:
        """Generate incremental capture ID e.g. ECH-CAP-2026-000001."""
        count = db.query(AudioCapture).count() + 1
        return f"ECH-CAP-2026-{count:06d}"


audio_capture_repository = AudioCaptureRepository()
