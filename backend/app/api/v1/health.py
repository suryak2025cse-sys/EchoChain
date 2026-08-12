from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.health import HealthCheckResponse
from app.services.health_service import HealthService

router = APIRouter()


@router.get("/health", response_model=HealthCheckResponse, summary="Health Check API")
def get_health(db: Session = Depends(get_db)):
    """
    Check API service and database connectivity status.
    Returns status ok, version, database status, and server details.
    """
    return HealthService.check_health(db)
