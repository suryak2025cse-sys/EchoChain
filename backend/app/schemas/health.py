from datetime import datetime
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field


class HealthCheckResponse(BaseModel):
    status: str = Field(..., example="ok")
    app_name: str = Field(..., example="EchoChain Provenance Platform")
    version: str = Field(..., example="1.0.0")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    database_status: str = Field(..., example="connected")
    environment: str = Field(..., example="development")
    details: Optional[Dict[str, Any]] = None
