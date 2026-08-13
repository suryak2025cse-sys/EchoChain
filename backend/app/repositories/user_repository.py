from typing import Optional
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.role import Role
from app.repositories.base_repository import BaseRepository


class UserRepository(BaseRepository[User]):
    def __init__(self):
        super().__init__(User)

    def get_by_email(self, db: Session, email: str) -> Optional[User]:
        return db.query(User).filter(User.email == email.lower().strip()).first()

    def get_by_reset_token(self, db: Session, token: str) -> Optional[User]:
        return db.query(User).filter(User.reset_token == token).first()

    def get_role_by_name(self, db: Session, role_name: str) -> Optional[Role]:
        return db.query(Role).filter(Role.name == role_name.upper()).first()

    def seed_roles_if_empty(self, db: Session):
        """Ensure standard roles exist in the database."""
        roles_def = [
            ("PRODUCER", "Harvester / Producer role with acoustic capture permissions"),
            ("CONSUMER", "Consumer / Public role with verification access"),
            ("CERTIFIER", "Certifier / Auditor role with attestation permissions"),
            ("ADMIN", "System Administrator role with full governance control"),
        ]
        for name, desc in roles_def:
            existing = db.query(Role).filter(Role.name == name).first()
            if not existing:
                db.add(Role(name=name, description=desc))
        db.commit()


user_repository = UserRepository()
