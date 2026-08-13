from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field


class IPFSUploadResponse(BaseModel):
    provenance_id: str = Field(..., example="ECH-PROV-2026-000001")
    ipfs_cid: str = Field(..., example="bafybeih...")
    ipfs_url: str = Field(..., example="https://gateway.pinata.cloud/ipfs/bafybeih...")
    pin_timestamp: datetime
    status: str = Field("PINNED_TO_IPFS", example="PINNED_TO_IPFS")
    message: str = "Audio evidence successfully pinned to IPFS decentralized storage."


class IPFSResponse(BaseModel):
    provenance_id: str = Field(..., example="ECH-PROV-2026-000001")
    ipfs_cid: Optional[str] = Field(None, example="bafybeih...")
    ipfs_url: Optional[str] = Field(None, example="https://gateway.pinata.cloud/ipfs/bafybeih...")
    audio_stream_url: str
    is_pinned: bool
    metadata: Dict[str, Any]
