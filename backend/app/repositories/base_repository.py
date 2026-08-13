from typing import Generic, TypeVar, Type, Optional, List
from sqlalchemy.orm import Session
from app.core.database import Base
from app.services.supabase_client import sync_record_to_supabase

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    def __init__(self, model: Type[ModelType]):
        self.model = model

    def get(self, db: Session, id: int) -> Optional[ModelType]:
        return db.query(self.model).filter(self.model.id == id).first()

    def get_multi(
        self, db: Session, *, skip: int = 0, limit: int = 100
    ) -> List[ModelType]:
        return db.query(self.model).offset(skip).limit(limit).all()

    def create(self, db: Session, *, obj_in_data: dict) -> ModelType:
        db_obj = self.model(**obj_in_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)

        # Sync created record live to Supabase PostgreSQL table
        try:
            tablename = getattr(self.model, "__tablename__", None)
            if tablename:
                sync_payload = {**obj_in_data}
                # Include auto-generated primary key or attributes if present
                if hasattr(db_obj, "id") and db_obj.id and "id" not in sync_payload:
                    sync_payload["id"] = db_obj.id
                sync_record_to_supabase(tablename, sync_payload)
        except Exception:
            pass

        return db_obj
