from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class PolygonAnchorResponse(BaseModel):
    provenance_id: str = Field(..., example="ECH-PROV-2026-000001")
    tx_hash: str = Field(..., example="0x7f3a9b2c...")
    block_number: int = Field(..., example=18294021)
    network: str = Field(..., example="Polygon Amoy Testnet")
    contract_address: str = Field(..., example="0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7")
    anchored_at: datetime
    status: str = Field("ANCHORED_ON_POLYGON", example="ANCHORED_ON_POLYGON")
    message: str = "Cryptographic provenance record successfully anchored on Polygon testnet."


class PolygonVerificationResponse(BaseModel):
    provenance_id: str = Field(..., example="ECH-PROV-2026-000001")
    is_anchored: bool
    tx_hash: Optional[str] = Field(None, example="0x7f3a9b2c...")
    block_number: Optional[int] = Field(None, example=18294021)
    network: Optional[str] = Field(None, example="Polygon Amoy Testnet")
    contract_address: Optional[str] = Field(None, example="0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7")
    stored_provenance_hash: Optional[str] = Field(None, example="7f3a9b2c...")
    status: str = Field(..., example="VALID_ONCHAIN")  # VALID_ONCHAIN or NOT_ANCHORED
    verified_at: datetime
    message: str
