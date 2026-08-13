import logging
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

logger = logging.getLogger(__name__)


def init_engine():
    """Probe PostgreSQL / Supabase database connection. If unreachable, gracefully fallback to SQLite."""
    db_url = settings.sync_database_url
    is_supabase = "supabase" in db_url.lower() or bool(settings.SUPABASE_URL)
    
    try:
        eng = create_engine(db_url, pool_pre_ping=True, echo=settings.DEBUG)
        with eng.connect() as conn:
            if is_supabase:
                logger.info("Connected to Supabase PostgreSQL database successfully.")
            else:
                logger.info("Connected to PostgreSQL database successfully.")
            return eng
    except Exception as e:
        logger.warning(
            f"Database connection probe failed ({e}). Falling back to SQLite for local development/testing."
        )
        return create_engine(
            "sqlite:///./echochain_dev.db",
            connect_args={"check_same_thread": False},
            echo=settings.DEBUG,
        )


engine = init_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db() -> Generator:
    """Dependency for obtaining database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
