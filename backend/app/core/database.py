import logging
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

logger = logging.getLogger(__name__)

# Fallback to SQLite in-memory or file database for development/testing if PostgreSQL is unaccessible
try:
    engine = create_engine(
        settings.sync_database_url,
        pool_pre_ping=True,
        echo=settings.DEBUG,
    )
except Exception as e:
    logger.warning(f"Could not connect to PostgreSQL ({e}). Falling back to SQLite for local development/testing.")
    engine = create_engine(
        "sqlite:///./echochain_dev.db",
        connect_args={"check_same_thread": False},
        echo=settings.DEBUG,
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db() -> Generator:
    """Dependency for obtaining database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
