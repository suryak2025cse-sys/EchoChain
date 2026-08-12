import logging
from sqlalchemy.sql import text
from sqlalchemy.orm import Session
from app.core.config import settings
from app.schemas.health import HealthCheckResponse

logger = logging.getLogger(__name__)


class HealthService:
    @staticmethod
    def check_health(db: Session) -> HealthCheckResponse:
        db_status = "disconnected"
        db_details = {}
        
        try:
            db.execute(text("SELECT 1"))
            db_status = "connected"
            db_details["dialects"] = db.bind.dialect.name if db.bind else "unknown"
        except Exception as e:
            logger.error(f"Health check DB probe failed: {str(e)}")
            db_status = f"error: {str(e)}"

        return HealthCheckResponse(
            status="ok" if db_status == "connected" else "degraded",
            app_name=settings.PROJECT_NAME,
            version=settings.VERSION,
            database_status=db_status,
            environment=settings.ENVIRONMENT,
            details=db_details,
        )
