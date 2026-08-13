from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class AudioCaptureResponse(BaseModel):
    id: int
    capture_id: str = Field(..., example="ECH-CAP-2026-000001")
    user_id: int
    product_id: Optional[int] = None
    file_name: str
    mime_type: str
    file_size: int
    duration: float
    sample_rate: int
    channels: int
    evidence_label: str = "Environmental audio evidence"
    capture_source: str
    created_at: datetime

    class Config:
        from_attributes = True


class AudioCaptureListResponse(BaseModel):
    items: List[AudioCaptureResponse]
    total: int
