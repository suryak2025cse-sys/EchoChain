from fastapi import APIRouter
from app.api.v1 import health, auth, products, audio, audio_capture, acoustic, liveness, provenance, ipfs, polygon, verify, certifier, security

api_router = APIRouter()

# Register V1 Routers
api_router.include_router(health.router, tags=["Health"])
api_router.include_router(auth.router)
api_router.include_router(products.router)
api_router.include_router(audio.router)
api_router.include_router(audio_capture.router)
api_router.include_router(acoustic.router)
api_router.include_router(liveness.router)
api_router.include_router(provenance.router)
api_router.include_router(ipfs.router)
api_router.include_router(polygon.router)
api_router.include_router(verify.router)
api_router.include_router(certifier.router)
api_router.include_router(security.router)

# Direct root-level aliases required by Phase specs (/api/acoustic, /api/liveness, /api/provenance, /api/ipfs, /api/polygon, /api/verify, /api/certifier, /api/security)
api_router.include_router(health.router, prefix="", include_in_schema=False)
api_router.include_router(acoustic.router, prefix="", include_in_schema=False)
api_router.include_router(liveness.router, prefix="", include_in_schema=False)
api_router.include_router(provenance.router, prefix="", include_in_schema=False)
api_router.include_router(ipfs.router, prefix="", include_in_schema=False)
api_router.include_router(polygon.router, prefix="", include_in_schema=False)
api_router.include_router(verify.router, prefix="", include_in_schema=False)
api_router.include_router(certifier.router, prefix="", include_in_schema=False)
api_router.include_router(security.router, prefix="", include_in_schema=False)
