from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.health import HealthCheckResponse
from app.services.health_service import HealthService
from app.services.supabase_client import get_supabase_health_status

router = APIRouter()


@router.get("/health", response_model=HealthCheckResponse, summary="Health Check API")
def get_health(db: Session = Depends(get_db)):
    """
    Check API service and database connectivity status.
    Returns status ok, version, database status, and server details.
    """
    return HealthService.check_health(db)


@router.get("/health/supabase", summary="Supabase Health Check API (Step 7)")
def get_supabase_health():
    """
    Health check endpoint verifying Supabase client connectivity and database endpoint.
    Exposes no sensitive credentials or keys.
    """
    return get_supabase_health_status()
