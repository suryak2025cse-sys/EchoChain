from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.audio_recording import AudioRecording
from app.repositories.base_repository import BaseRepository


class AudioRepository(BaseRepository[AudioRecording]):
    def __init__(self):
        super().__init__(AudioRecording)

    def get_by_product_id(self, db: Session, product_id: int) -> List[AudioRecording]:
        return (
            db.query(AudioRecording)
            .filter(AudioRecording.product_id == product_id)
            .order_by(AudioRecording.created_at.desc())
            .all()
        )

    def get_latest_for_product(self, db: Session, product_id: int) -> Optional[AudioRecording]:
        return (
            db.query(AudioRecording)
            .filter(AudioRecording.product_id == product_id)
            .order_by(AudioRecording.created_at.desc())
            .first()
        )


audio_repository = AudioRepository()
