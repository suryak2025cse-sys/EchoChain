from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db, engine, Base
from app.api.router import api_router
from app.api.v1 import auth, products, audio, audio_capture, acoustic, liveness, provenance, ipfs, polygon, verify, certifier, security
from app.schemas.health import HealthCheckResponse
from app.services.health_service import HealthService

# Create database tables (if any defined in models)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS cleanly for production & cross-origin Vercel requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
