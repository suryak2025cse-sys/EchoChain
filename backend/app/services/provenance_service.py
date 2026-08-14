import json
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.product import Product
from app.models.audio_capture import AudioCapture
from app.models.provenance_record import ProvenanceRecord
from app.repositories.product_repository import product_repository
from app.repositories.audio_capture_repository import audio_capture_repository
from app.repositories.acoustic_repository import acoustic_repository
from app.repositories.liveness_repository import liveness_result_repository
from app.repositories.provenance_repository import provenance_repository
from app.repositories.audit_log_repository import audit_log_repository
from app.services.acoustic_service import AcousticService
from app.services.crypto_commitment import CanonicalHasher
from app.schemas.provenance import (
    ProvenanceCreateRequest,
    ProvenanceRecordResponse,
    ProvenanceListResponse,
    ProvenanceSealResponse,
    ProvenanceVerificationResponse
)


class ProvenanceService:
    @staticmethod
    def create_provenance(db: Session, current_user: User, req: ProvenanceCreateRequest) -> ProvenanceRecordResponse:
        # 1. Product lookup
        product = product_repository.get(db, req.product_id)
        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Product ID {req.product_id} not found.")

        # 2. Capture lookup
        capture = audio_capture_repository.get_by_capture_id(db, req.capture_id)
        if not capture:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Audio capture '{req.capture_id}' not found.")

        # 3. Acoustic Fingerprint lookup (or trigger analysis)
        acoustic_fp = acoustic_repository.get_by_capture_id(db, req.capture_id)
        if not acoustic_fp:
            AcousticService.analyze_capture(db, req.capture_id, current_user)
            acoustic_fp = acoustic_repository.get_by_capture_id(db, req.capture_id)

        # 4. Liveness Result lookup (or baseline)
        liveness_res = liveness_result_repository.get_by_capture_id(db, req.capture_id)
        liveness_score = liveness_res.liveness_score if liveness_res else 92.0
        replay_risk = liveness_res.replay_risk if liveness_res else "LOW"
        liveness_status = liveness_res.status if liveness_res else "LIKELY_LIVE"

        # Generate unique Provenance Record ID
        count = db.query(ProvenanceRecord).count() + 1
        provenance_id = f"ECH-PROV-2026-{count:06d}"
        server_timestamp = datetime.now(timezone.utc).isoformat()

        # Build Canonical Payload (Deterministic Hashing input)
        canonical_payload = CanonicalHasher.build_canonical_payload(
            provenance_id=provenance_id,
            capture_id=capture.capture_id,
            acoustic_fingerprint=acoustic_fp.fingerprint,
            product_name=product.product_name,
            batch_id=product.batch_id,
            region=product.region,
            country=product.country,
            server_timestamp=server_timestamp,
            algorithm_version="ECHO-SHA256-v1.0"
        )

        # Compute Immutable Deterministic SHA-256 Provenance Hash
        provenance_hash = CanonicalHasher.compute_sha256_hash(canonical_payload)

        # Build Full Metadata JSON
        metadata_json = {
            "provenance_id": provenance_id,
            "canonical_payload": canonical_payload,
            "product": {
                "id": product.id,
                "product_name": product.product_name,
                "brand": product.brand,
                "product_type": product.product_type,
                "batch_id": product.batch_id,
                "region": product.region,
                "country": product.country,
                "harvest_date": str(product.harvest_date)
            },
            "capture": {
                "capture_id": capture.capture_id,
                "file_name": capture.file_name,
                "duration": capture.duration,
                "evidence_label": capture.evidence_label,
                "source": capture.capture_source
            },
            "acoustic": {
                "fingerprint": acoustic_fp.fingerprint,
                "algorithm_version": acoustic_fp.algorithm_version,
                "signal_label": acoustic_fp.signal_label
            },
            "liveness": {
                "liveness_score": liveness_score,
                "replay_risk": replay_risk,
                "status": liveness_status
            },
            "server_timestamp": server_timestamp
        }

        final_status = "READY_FOR_SEAL"

        # Check existing
        existing = provenance_repository.get_by_capture_id(db, req.capture_id)
        if existing:
            existing.product_id = product.id
            existing.batch_id = product.batch_id
            existing.region = product.region
            existing.country = product.country
            existing.fingerprint = acoustic_fp.fingerprint
            existing.liveness_score = liveness_score
            existing.replay_risk = replay_risk
            existing.liveness_status = liveness_status
            existing.status = final_status
            existing.provenance_hash = provenance_hash
            existing.metadata_json = metadata_json
            db.commit()
            db.refresh(existing)
            prov_record = existing
        else:
            prov_record = provenance_repository.create(
                db,
                obj_in_data={
                    "provenance_id": provenance_id,
                    "product_id": product.id,
                    "batch_id": product.batch_id,
                    "capture_id": req.capture_id,
                    "producer_id": current_user.id,
                    "region": product.region,
                    "country": product.country,
                    "fingerprint": acoustic_fp.fingerprint,
                    "liveness_score": liveness_score,
                    "replay_risk": replay_risk,
                    "liveness_status": liveness_status,
                    "status": final_status,
                    "provenance_hash": provenance_hash,
                    "metadata_json": metadata_json,
                    "is_sealed": False,
                    "sealed_at": None
                }
            )

        audit_log_repository.log(
            db,
            action="PROVENANCE_RECORD_CREATED",
            user_id=current_user.id,
            details=f"Created provenance record {provenance_id} (SHA256: {provenance_hash[:10]}...)"
        )

        try:
            from app.services.security_service import SecurityService
            SecurityService.evaluate_provenance_security(db, prov_record.provenance_id)
        except Exception as e:
            logger.warning(f"Provenance security evaluation warning: {e}")

        return ProvenanceRecordResponse.model_validate(prov_record)

    @staticmethod
    def seal_provenance(db: Session, identifier: str, current_user: User) -> ProvenanceSealResponse:
        """
        Finalizes and seals the provenance record with a cryptographic SHA-256 commitment.
        """
        if identifier.isdigit():
            record = provenance_repository.get(db, int(identifier))
        else:
            record = provenance_repository.get_by_provenance_id(db, identifier)

        if not record:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Provenance record '{identifier}' not found.")

        now = datetime.now(timezone.utc)
        record.is_sealed = True
        record.sealed_at = now
        record.status = "SEALED"
        db.commit()
        db.refresh(record)

        audit_log_repository.log(
            db,
            action="PROVENANCE_RECORD_SEALED",
            user_id=current_user.id,
            details=f"Sealed provenance record {record.provenance_id} with SHA-256: {record.provenance_hash}"
        )

        try:
            from app.services.security_service import SecurityService
            SecurityService.evaluate_provenance_security(db, record.provenance_id)
        except Exception as e:
            logger.warning(f"Sealed provenance security evaluation warning: {e}")

        return ProvenanceSealResponse(
            provenance_id=record.provenance_id,
            provenance_hash=record.provenance_hash,
            status="SEALED",
            is_sealed=True,
            sealed_at=now,
            message="Provenance record sealed with deterministic SHA-256 commitment hash."
        )

    @staticmethod
    def verify_provenance(db: Session, identifier: str) -> ProvenanceVerificationResponse:
        """
        Re-computes the deterministic SHA-256 hash from canonical metadata fields and detects tampering.
        """
        if identifier.isdigit():
            record = provenance_repository.get(db, int(identifier))
        else:
            record = provenance_repository.get_by_provenance_id(db, identifier)

        if not record:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Provenance record '{identifier}' not found.")

        meta = record.metadata_json or {}
        canonical_payload = meta.get("canonical_payload")

        # Fallback build if missing
        if not canonical_payload:
            canonical_payload = CanonicalHasher.build_canonical_payload(
                provenance_id=record.provenance_id,
                capture_id=record.capture_id,
                acoustic_fingerprint=record.fingerprint,
                product_name=meta.get("product", {}).get("product_name", record.product.product_name if record.product else "Highland Crop"),
                batch_id=record.batch_id,
                region=record.region,
                country=record.country,
                server_timestamp=meta.get("server_timestamp", str(record.created_at)),
                algorithm_version="ECHO-SHA256-v1.0"
            )

        is_valid, computed_hash = CanonicalHasher.verify_commitment(canonical_payload, record.provenance_hash)
        now = datetime.now(timezone.utc)

        return ProvenanceVerificationResponse(
            provenance_id=record.provenance_id,
            stored_hash=record.provenance_hash,
            computed_hash=computed_hash,
            status="VALID" if is_valid else "TAMPERED",
            is_tamper_evident=is_valid,
            verified_at=now,
            canonical_payload=canonical_payload
        )

    @staticmethod
    def get_provenance(db: Session, identifier: str) -> ProvenanceRecordResponse:
        if identifier.isdigit():
            rec = provenance_repository.get(db, int(identifier))
        else:
            rec = provenance_repository.get_by_provenance_id(db, identifier)

        if not rec:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Provenance record '{identifier}' not found.")
        return ProvenanceRecordResponse.model_validate(rec)

    @staticmethod
    def list_provenance(db: Session, current_user: User) -> ProvenanceListResponse:
        role_name = current_user.role.name if current_user.role else "PRODUCER"
        if role_name in ["ADMIN", "CERTIFIER", "REGULATOR"]:
            records = provenance_repository.get_multi(db)
        else:
            records = provenance_repository.list_by_producer(db, current_user.id)
        
        items = [ProvenanceRecordResponse.model_validate(r) for r in records]
        return ProvenanceListResponse(items=items, total=len(items))
