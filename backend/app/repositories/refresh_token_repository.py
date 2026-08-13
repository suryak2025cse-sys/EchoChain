from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy.orm import Session
from app.models.refresh_token import RefreshToken
from app.repositories.base_repository import BaseRepository
from app.core.config import settings


class RefreshTokenRepository(BaseRepository[RefreshToken]):
    def __init__(self):
        super().__init__(RefreshToken)

    def create_token(self, db: Session, user_id: int, token_str: str) -> RefreshToken:
        expires_at = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        db_obj = RefreshToken(
            user_id=user_id,
            token=token_str,
            expires_at=expires_at,
            revoked=False
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_valid_token(self, db: Session, token_str: str) -> Optional[RefreshToken]:
        token_record = db.query(RefreshToken).filter(
            RefreshToken.token == token_str,
            RefreshToken.revoked == False,
            RefreshToken.expires_at > datetime.utcnow()
        ).first()
        return token_record

    def revoke_token(self, db: Session, token_str: str) -> bool:
        token_record = db.query(RefreshToken).filter(RefreshToken.token == token_str).first()
        if token_record:
            token_record.revoked = True
            db.commit()
            return True
        return False

    def revoke_all_for_user(self, db: Session, user_id: int):
        db.query(RefreshToken).filter(
            RefreshToken.user_id == user_id,
            RefreshToken.revoked == False
        ).update({"revoked": True})
        db.commit()


refresh_token_repository = RefreshTokenRepository()
