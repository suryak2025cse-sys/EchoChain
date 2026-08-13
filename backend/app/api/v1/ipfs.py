import os
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_active_user
from app.models.user import User
from app.models.provenance_record import ProvenanceRecord
from app.repositories.provenance_repository import provenance_repository
from app.repositories.audio_capture_repository import audio_capture_repository
from app.repositories.audit_log_repository import audit_log_repository
from app.services.ipfs_service import IPFSService
from app.schemas.ipfs import IPFSUploadResponse, IPFSResponse

router = APIRouter(prefix="/ipfs", tags=["IPFS Audio Storage"])


@router.post("/upload/{identifier}", response_model=IPFSUploadResponse)
def upload_audio_to_ipfs(
    identifier: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Pins the environmental audio evidence associated with a Provenance Record to IPFS via Pinata API.
    Updates the Supabase provenance record with the resulting IPFS CID.
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

    # Fetch Audio Capture
    capture = audio_capture_repository.get_by_capture_id(db, record.capture_id)
    if not capture:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Associated audio capture '{record.capture_id}' not found."
        )

    if not os.path.exists(capture.file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Audio file '{capture.file_name}' not found on local storage."
        )

    # Read Audio File Bytes
    with open(capture.file_path, "rb") as f:
        file_bytes = f.read()

    # Upload / Pin to IPFS via IPFSService
    ipfs_cid, ipfs_url = IPFSService.upload_file_to_ipfs(
        file_bytes=file_bytes,
        file_name=capture.file_name,
        metadata={"provenance_id": record.provenance_id, "capture_id": capture.capture_id}
    )

    # Update database record & sync to Supabase
    now = datetime.now(timezone.utc)
    record.ipfs_cid = ipfs_cid
    record.ipfs_url = ipfs_url
    
    # Update JSON metadata with IPFS pointer
    meta = record.metadata_json or {}
    meta["ipfs"] = {
        "cid": ipfs_cid,
        "gateway_url": ipfs_url,
        "pinned_at": now.isoformat()
    }
    record.metadata_json = meta

    db.commit()
    db.refresh(record)

    audit_log_repository.log(
        db,
        action="IPFS_AUDIO_PINNED",
        user_id=current_user.id,
        details=f"Pinned audio for provenance {record.provenance_id} to IPFS (CID: {ipfs_cid})"
    )

    return IPFSUploadResponse(
        provenance_id=record.provenance_id,
        ipfs_cid=ipfs_cid,
        ipfs_url=ipfs_url,
        pin_timestamp=now,
        status="PINNED_TO_IPFS",
        message="Audio evidence successfully pinned to IPFS decentralized storage."
    )


@router.get("/{identifier}", response_model=IPFSResponse)
def get_ipfs_audio_metadata(
    identifier: str,
    db: Session = Depends(get_db)
):
    """
    Retrieves IPFS metadata and streaming audio gateway URL for a provenance record.
    Allows consumers to play approved environmental audio evidence directly from IPFS.
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

    audio_stream_url = record.ipfs_url or f"/api/v1/audio/stream/{record.capture_id}"

    return IPFSResponse(
        provenance_id=record.provenance_id,
        ipfs_cid=record.ipfs_cid,
        ipfs_url=record.ipfs_url,
        audio_stream_url=audio_stream_url,
        is_pinned=bool(record.ipfs_cid),
        metadata=record.metadata_json or {}
    )
