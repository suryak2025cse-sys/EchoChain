import logging
import traceback
from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db, engine, Base, SessionLocal
from app.repositories.user_repository import user_repository
import app.models  # Guarantees all 12 SQLAlchemy ORM models register metadata tables before create_all
from app.api.router import api_router
from app.api.v1 import auth, products, audio, audio_capture, acoustic, liveness, provenance, ipfs, polygon, verify, certifier, security
from app.schemas.health import HealthCheckResponse
from app.services.health_service import HealthService

logger = logging.getLogger(__name__)

# Create database tables automatically for all registered models
Base.metadata.create_all(bind=engine)

# Seed default database roles automatically on startup
try:
    with SessionLocal() as db_session:
        user_repository.seed_roles_if_empty(db_session)
except Exception as err:
    logger.warning(f"Database role seeding notice: {err}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
)

# 1. Standard FastAPI CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 2. Universal Custom CORS & Preflight OPTIONS Middleware
@app.middleware("http")
async def universal_cors_middleware(request: Request, call_next):
    origin = request.headers.get("origin", "*")
    
    # Preflight OPTIONS handler guarantees HTTP 200 with full CORS headers
    if request.method == "OPTIONS":
        response = JSONResponse(content={"status": "ok"})
        response.headers["Access-Control-Allow-Origin"] = origin
        if origin != "*":
            response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD"
        response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type, Accept, Origin, X-Requested-With, x-client-info, apikey"
        response.headers["Access-Control-Max-Age"] = "86400"
        return response

    try:
        response = await call_next(request)
    except Exception as exc:
        logger.error(f"Unhandled exception in request: {exc}\n{traceback.format_exc()}")
        response = JSONResponse(
            status_code=500,
            content={"detail": f"Server Error: {str(exc)}"}
        )

    response.headers["Access-Control-Allow-Origin"] = origin
    if origin != "*":
        response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD"
    response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type, Accept, Origin, X-Requested-With, x-client-info, apikey"
    return response


# Include API Router under /api/v1
app.include_router(api_router, prefix=settings.API_V1_STR)

# Direct root & /api level aliases to guarantee 0 404s across all endpoints
app.include_router(auth.router, prefix="/api", include_in_schema=False)
app.include_router(auth.router, prefix="", include_in_schema=False)

app.include_router(products.router, prefix="/api", include_in_schema=False)
app.include_router(products.router, prefix="", include_in_schema=False)

app.include_router(audio.router, prefix="/api", include_in_schema=False)
app.include_router(audio_capture.router, prefix="/api", include_in_schema=False)
app.include_router(acoustic.router, prefix="/api", include_in_schema=False)
app.include_router(liveness.router, prefix="/api", include_in_schema=False)

app.include_router(provenance.router, prefix="/api", include_in_schema=False)
app.include_router(ipfs.router, prefix="/api", include_in_schema=False)
app.include_router(polygon.router, prefix="/api", include_in_schema=False)
app.include_router(verify.router, prefix="/api", include_in_schema=False)

app.include_router(certifier.router, prefix="/api", include_in_schema=False)
app.include_router(security.router, prefix="/api", include_in_schema=False)


@app.get("/api/health", response_model=HealthCheckResponse, tags=["Health"])
def root_health_check(db: Session = Depends(get_db)):
    """Direct root health check endpoint as requested in Phase 1 specs."""
    return HealthService.check_health(db)


@app.get("/", tags=["Root"])
def root():
    return {
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs",
        "health": "/api/health",
    }
