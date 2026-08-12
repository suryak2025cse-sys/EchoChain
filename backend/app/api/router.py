from fastapi import APIRouter
from app.api.v1 import health

api_router = APIRouter()

# Register V1 Routers
api_router.include_router(health.router, tags=["Health"])
