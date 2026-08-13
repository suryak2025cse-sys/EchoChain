from sqlalchemy import Column, String, Text
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class Role(BaseModel):
    __tablename__ = "roles"

    name = Column(String(50), unique=True, index=True, nullable=False)  # PRODUCER, CONSUMER, CERTIFIER, ADMIN
    description = Column(Text, nullable=True)

    users = relationship("User", back_populates="role")
