import secrets
import hashlib
from datetime import datetime, timedelta, timezone
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session

from app.models.liveness_challenge import LivenessChallenge
from app.models.liveness_result import LivenessResult
from app.repositories.base_repository import BaseRepository


class LivenessChallengeRepository(BaseRepository[LivenessChallenge]):
    def __init__(self):
        super().__init__(LivenessChallenge)

    def get_by_challenge_id(self, db: Session, challenge_id: str) -> Optional[LivenessChallenge]:
        return db.query(LivenessChallenge).filter(LivenessChallenge.challenge_id == challenge_id).first()

    def generate_challenge(self, db: Session, user_id: int, expires_in_sec: int = 30) -> Tuple[LivenessChallenge, str]:
        count = db.query(LivenessChallenge).count() + 1
        challenge_id = f"CH-2026-{count:06d}"
        
        raw_nonce = secrets.token_hex(16)
        nonce_hash = hashlib.sha256(raw_nonce.encode("utf-8")).hexdigest()

        now = datetime.now(timezone.utc)
        expires_at = now + timedelta(seconds=expires_in_sec)

        challenge = self.create(
            db,
            obj_in_data={
                "challenge_id": challenge_id,
                "user_id": user_id,
                "nonce_hash": nonce_hash,
                "expires_at": expires_at,
                "status": "ACTIVE"
            }
        )
        return challenge, raw_nonce

    def mark_used(self, db: Session, challenge_id: str):
        ch = self.get_by_challenge_id(db, challenge_id)
        if ch:
            ch.status = "USED"
            ch.used_at = datetime.now(timezone.utc)
            db.commit()


class LivenessResultRepository(BaseRepository[LivenessResult]):
    def __init__(self):
        super().__init__(LivenessResult)

    def get_by_capture_id(self, db: Session, capture_id: str) -> Optional[LivenessResult]:
        return db.query(LivenessResult).filter(LivenessResult.capture_id == capture_id).first()


liveness_challenge_repository = LivenessChallengeRepository()
liveness_result_repository = LivenessResultRepository()
