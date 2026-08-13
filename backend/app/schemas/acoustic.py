from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class FeatureVectorSummary(BaseModel):
    sample_rate: int = 22050
    duration_sec: float
    mfcc_means: List[float]
    mfcc_stds: List[float]
    spectral_centroid_mean: float
    spectral_centroid_std: float
    spectral_bandwidth_mean: float
    spectral_bandwidth_std: float
    spectral_contrast_mean: float
    spectral_contrast_std: float
    zero_crossing_rate_mean: float
    zero_crossing_rate_std: float
    chroma_means: List[float]
    chroma_stds: List[float]


class AcousticFingerprintResponse(BaseModel):
    id: int
    capture_id: str
    fingerprint: str = Field(..., example="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")
    fingerprint_hex_vector: str
    feature_vector: Dict[str, Any]
    algorithm_version: str = "ECHO-DSP-v1.0"
    signal_label: str = "Acoustic similarity signal"
    waveform_plot_b64: Optional[str] = None
    melspectrogram_plot_b64: Optional[str] = None
    mfcc_plot_b64: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class AcousticFingerprintListResponse(BaseModel):
    items: List[AcousticFingerprintResponse]
    total: int
