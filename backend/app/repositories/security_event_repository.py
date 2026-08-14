from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.security_event import SecurityEvent
from app.repositories.base_repository import BaseRepository


class SecurityEventRepository(BaseRepository[SecurityEvent]):
    def __init__(self):
        super().__init__(SecurityEvent)

    def get_by_event_id(self, db: Session, event_id: str) -> Optional[SecurityEvent]:
        return db.query(SecurityEvent).filter(SecurityEvent.event_id == event_id).first()

    def get_existing_open_event(
        self,
        db: Session,
        event_type: str,
        provenance_id: Optional[str] = None,
        capture_id: Optional[str] = None
    ) -> Optional[SecurityEvent]:
        query = db.query(SecurityEvent).filter(
            SecurityEvent.event_type == event_type,
            SecurityEvent.status.in_(["OPEN", "INVESTIGATING"])
        )
        if provenance_id:
            query = query.filter(SecurityEvent.provenance_id == provenance_id)
        if capture_id:
            query = query.filter(SecurityEvent.capture_id == capture_id)
        return query.first()

    def list_filtered(
        self,
        db: Session,
        risk_level: Optional[str] = None,
        event_type: Optional[str] = None,
        status: Optional[str] = None,
        limit: int = 50,
        skip: int = 0
    ) -> List[SecurityEvent]:
        query = db.query(SecurityEvent)
        if risk_level:
            query = query.filter(SecurityEvent.risk_level == risk_level.upper())
        if event_type:
            query = query.filter(SecurityEvent.event_type == event_type.upper())
        if status:
            query = query.filter(SecurityEvent.status == status.upper())

        return query.order_by(SecurityEvent.created_at.desc()).offset(skip).limit(limit).all()

    def count_filtered(
        self,
        db: Session,
        risk_level: Optional[str] = None,
        event_type: Optional[str] = None,
        status: Optional[str] = None
    ) -> int:
        query = db.query(SecurityEvent)
        if risk_level:
            query = query.filter(SecurityEvent.risk_level == risk_level.upper())
        if event_type:
            query = query.filter(SecurityEvent.event_type == event_type.upper())
        if status:
            query = query.filter(SecurityEvent.status == status.upper())
        return query.count()


security_event_repository = SecurityEventRepository()
