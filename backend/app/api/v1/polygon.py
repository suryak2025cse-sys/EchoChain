from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_active_user
from app.models.user import User
from app.repositories.provenance_repository import provenance_repository
from app.repositories.audit_log_repository import audit_log_repository
from app.services.polygon_service import PolygonService
from app.services.provenance_service import ProvenanceService
from app.schemas.polygon import PolygonAnchorResponse, PolygonVerificationResponse

router = APIRouter(prefix="/polygon", tags=["Polygon Testnet Blockchain Anchoring"])


@router.post("/anchor/{identifier}", response_model=PolygonAnchorResponse)
def anchor_provenance_on_polygon(
    identifier: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Anchors a cryptographic provenance record on Polygon Testnet blockchain.
    Stores ONLY provenanceId, SHA-256 provenanceHash, and IPFS CID.
    Never stores exact GPS, raw audio, or user PII on-chain.
    """
    if identifier.isdigit():
        record = provenance_repository.get(db, int(identifier))
    else:
        record = provenance_repository.get_by_provenance_id(db, identifier)

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Provenance record '{identifier}' not found."
        )

    # Auto-seal if not yet sealed
    if not record.is_sealed:
        ProvenanceService.seal_provenance(db, record.provenance_id, current_user)
        db.refresh(record)

    # Perform Blockchain Transaction via PolygonService
    anchor_result = PolygonService.anchor_provenance_record(
        provenance_id=record.provenance_id,
        provenance_hash=record.provenance_hash,
        ipfs_cid=record.ipfs_cid
    )

    # Update Database Model & sync live to Supabase
    now = datetime.now(timezone.utc)
    record.tx_hash = anchor_result["tx_hash"]
    record.block_number = anchor_result["block_number"]
    record.network = anchor_result["network"]
    record.contract_address = anchor_result["contract_address"]
    record.is_anchored = True
    record.anchored_at = anchor_result["anchored_at"]
    record.status = "ANCHORED"

    # Update metadata_json with blockchain info
    meta = record.metadata_json or {}
    meta["blockchain"] = {
        "network": anchor_result["network"],
        "contract_address": anchor_result["contract_address"],
        "tx_hash": anchor_result["tx_hash"],
        "block_number": anchor_result["block_number"],
        "anchored_at": now.isoformat()
    }
    record.metadata_json = meta

    db.commit()
    db.refresh(record)

    audit_log_repository.log(
        db,
        action="POLYGON_PROVENANCE_ANCHORED",
        user_id=current_user.id,
        details=f"Anchored provenance record {record.provenance_id} on Polygon testnet (Tx: {record.tx_hash[:12]}...)"
    )

    return PolygonAnchorResponse(
        provenance_id=record.provenance_id,
        tx_hash=record.tx_hash,
        block_number=record.block_number,
        network=record.network,
        contract_address=record.contract_address,
        anchored_at=record.anchored_at,
        status="ANCHORED_ON_POLYGON",
        message="Cryptographic provenance record successfully anchored on Polygon testnet."
    )


@router.get("/verify/{identifier}", response_model=PolygonVerificationResponse)
@router.post("/verify/{identifier}", response_model=PolygonVerificationResponse)
def verify_polygon_anchor(
    identifier: str,
    db: Session = Depends(get_db)
):
    """
    Verifies on-chain Polygon blockchain transaction anchor for a provenance record.
    """
    if identifier.isdigit():
        record = provenance_repository.get(db, int(identifier))
    else:
        record = provenance_repository.get_by_provenance_id(db, identifier)

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Provenance record '{identifier}' not found."
        )

    ver = PolygonService.verify_onchain_anchor(
        provenance_id=record.provenance_id,
        stored_tx_hash=record.tx_hash,
        stored_hash=record.provenance_hash
    )

    return PolygonVerificationResponse(
        provenance_id=record.provenance_id,
        is_anchored=bool(record.is_anchored),
        tx_hash=record.tx_hash,
        block_number=record.block_number,
        network=record.network,
        contract_address=record.contract_address,
        stored_provenance_hash=record.provenance_hash,
        status=ver["status"],
        verified_at=datetime.now(timezone.utc),
        message=ver["message"]
    )
