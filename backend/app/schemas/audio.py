from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class AudioMetadataExtraction(BaseModel):
    duration: float = Field(..., description="Duration in seconds")
    sample_rate: int = Field(44100, description="Sample rate in Hz")
    channels: int = Field(1, description="Channels count (1=mono, 2=stereo)")
    file_size: int = Field(..., description="Size in bytes")
    mime_type: str = Field(...)


class AudioRecordingResponse(BaseModel):
    id: int
    product_id: int
    file_name: str
    mime_type: str
    file_size: int
    duration: float
    sample_rate: int
    channels: int
    storage_status: str
    processing_status: str
    created_at: datetime

    class Config:
        from_attributes = True


class AudioProcessRequest(BaseModel):
    action: str = Field("EXTRACT_FEATURES", description="Processing action trigger")
