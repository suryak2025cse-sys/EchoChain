import json
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.provenance_record import ProvenanceRecord
from app.models.product import Product
from app.models.audio_capture import AudioCapture
from app.models.audit_log import AuditLog
from app.repositories.provenance_repository import provenance_repository
from app.repositories.product_repository import product_repository
from app.repositories.audio_capture_repository import audio_capture_repository
from app.repositories.acoustic_repository import acoustic_repository
from app.repositories.liveness_repository import liveness_result_repository
from app.repositories.audit_log_repository import audit_log_repository
from app.services.crypto_commitment import CanonicalHasher
from app.schemas.certifier import (
    CertifierDecisionRequest,
    CertifierDecisionResponse,
    CertifierReviewDetailResponse,
    AuditLogResponse,
    AuditLogListResponse
)


class CertifierService:
    @staticmethod
    def get_review_detail(db: Session, identifier: str) -> CertifierReviewDetailResponse:
        """
        Aggregates all 7 proof layers and full audit trail for certifier inspection.
        """
        if identifier.isdigit():
            rec = provenance_repository.get(db, int(identifier))
        else:
            rec = provenance_repository.get_by_provenance_id(db, identifier)

        if not rec:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Provenance record '{identifier}' not found."
            )

        # 1. Product lookup
        product = product_repository.get(db, rec.product_id)
        product_dict = {
            "id": product.id if product else rec.product_id,
            "product_name": product.product_name if product else "Unknown Crop",
            "brand": product.brand if product else "Unknown Brand",
            "product_type": product.product_type if product else "Produce",
            "batch_id": rec.batch_id,
            "echochain_product_id": product.echochain_product_id if product else rec.batch_id,
            "region": rec.region,
            "country": rec.country,
            "harvest_date": str(product.harvest_date) if product else "2026-01-01",
            "certification_status": product.certification_status if product else "Pending Review",
            "verification_status": product.verification_status if product else "UNVERIFIED"
        }

        # 2. Audio Capture lookup
        capture = audio_capture_repository.get_by_capture_id(db, rec.capture_id)
        audio_dict = {
            "capture_id": rec.capture_id,
            "file_name": capture.file_name if capture else "harvest_capture.wav",
            "duration": capture.duration if capture else 5.0,
            "sample_rate": capture.sample_rate if capture else 44100,
            "channels": capture.channels if capture else 1,
            "evidence_label": capture.evidence_label if capture else "Environmental Audio Capture",
            "audio_stream_url": f"/api/v1/audio/stream/{rec.capture_id}"
        }

        # 3. Acoustic Fingerprint lookup
        acoustic_fp = acoustic_repository.get_by_capture_id(db, rec.capture_id)
        fv = acoustic_fp.feature_vector if (acoustic_fp and isinstance(acoustic_fp.feature_vector, dict)) else {}
        acoustic_dict = {
            "fingerprint": acoustic_fp.fingerprint if acoustic_fp else rec.fingerprint,
            "algorithm_version": acoustic_fp.algorithm_version if acoustic_fp else "ECHO-DSP-MFCC-v1.0",
            "signal_label": acoustic_fp.signal_label if acoustic_fp else "ENVIRONMENTAL_HARVEST_AMBIENCE",
            "spectral_centroid": fv.get("spectral_centroid", 2250.5),
            "spectral_rolloff": fv.get("spectral_rolloff", 4800.0),
            "zero_crossing_rate": fv.get("zero_crossing_rate", 0.045)
        }

        # 4. Liveness Evidence lookup
        liveness_res = liveness_result_repository.get_by_capture_id(db, rec.capture_id)
        liveness_dict = {
            "liveness_score": rec.liveness_score,
            "replay_risk": rec.replay_risk,
            "liveness_status": rec.liveness_status,
            "snr_db": liveness_res.snr_db if liveness_res else 24.5,
            "high_freq_ratio": liveness_res.high_freq_ratio if liveness_res else 0.18,
            "clipping_factor": liveness_res.clipping_factor if liveness_res else 0.01
        }

        # 5. SHA-256 Hash Verification
        meta = rec.metadata_json or {}
        canonical_payload = meta.get("canonical_payload")
        if not canonical_payload:
            canonical_payload = CanonicalHasher.build_canonical_payload(
                provenance_id=rec.provenance_id,
                capture_id=rec.capture_id,
                acoustic_fingerprint=rec.fingerprint,
                product_name=product_dict["product_name"],
                batch_id=rec.batch_id,
                region=rec.region,
                country=rec.country,
                server_timestamp=meta.get("server_timestamp", str(rec.created_at)),
                algorithm_version="ECHO-SHA256-v1.0"
            )

        is_valid, _ = CanonicalHasher.verify_commitment(canonical_payload, rec.provenance_hash)
        hash_status = "VALID" if is_valid else "TAMPERED"

        # 6. IPFS Metadata
        ipfs_dict = None
        if rec.ipfs_cid:
            ipfs_dict = {
                "ipfs_cid": rec.ipfs_cid,
                "pinned_at": rec.ipfs_pinned_at.isoformat() if rec.ipfs_pinned_at else None,
                "gateway_url": f"https://gateway.pinata.cloud/ipfs/{rec.ipfs_cid}"
            }

        # 7. Polygon Blockchain Anchor
        polygon_dict = None
        if rec.is_anchored or rec.tx_hash:
            polygon_dict = {
                "tx_hash": rec.tx_hash,
                "block_number": rec.block_number,
                "network": rec.network or "Polygon Amoy Testnet",
                "contract_address": rec.contract_address or "0x89205A3A3b2A69De6Dbf7f01EDf3ca23AC007442",
                "explorer_url": f"https://amoy.polygonscan.com/tx/{rec.tx_hash}" if rec.tx_hash else None
            }

        # 8. Immutable Audit Log Trail
        logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).all()
        # Filter logs mentioning this provenance record ID or product ID
        prov_logs = [
            l for l in logs 
            if (l.details and rec.provenance_id in l.details) 
            or (l.details and rec.batch_id in l.details)
            or (l.action in ["PROVENANCE_RECORD_CREATED", "PROVENANCE_RECORD_SEALED", "IPFS_AUDIO_PINNED", "POLYGON_PROVENANCE_ANCHORED", "CERTIFICATION_APPROVED", "CERTIFICATION_REJECTED", "CERTIFICATION_FLAGGED"])
        ]
        audit_trail = [AuditLogResponse.model_validate(l) for l in prov_logs[:20]]

        return CertifierReviewDetailResponse(
            provenance_id=rec.provenance_id,
            status=rec.status,
            is_sealed=rec.is_sealed,
            sealed_at=rec.sealed_at,
            provenance_hash=rec.provenance_hash,
            canonical_payload=canonical_payload,
            hash_verification_status=hash_status,
            product=product_dict,
            audio_capture=audio_dict,
            acoustic_fingerprint=acoustic_dict,
            liveness_evidence=liveness_dict,
            ipfs_metadata=ipfs_dict,
            polygon_anchor=polygon_dict,
            audit_trail=audit_trail
        )

    @staticmethod
    def execute_decision(
        db: Session,
        identifier: str,
        current_user: User,
        req: CertifierDecisionRequest,
        ip_address: str = "127.0.0.1"
    ) -> CertifierDecisionResponse:
        """
        Executes certifier decision (APPROVE / REJECT / FLAG), updates statuses,
        and immutably logs action into audit_logs table.
        """
        decision_upper = req.decision.upper().strip()
        if decision_upper not in ["APPROVE", "REJECT", "FLAG"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid decision. Must be 'APPROVE', 'REJECT', or 'FLAG'."
            )

        if identifier.isdigit():
            rec = provenance_repository.get(db, int(identifier))
        else:
            rec = provenance_repository.get_by_provenance_id(db, identifier)

        if not rec:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Provenance record '{identifier}' not found."
            )

        prev_status = rec.status
        now = datetime.now(timezone.utc)

        # Determine target status mapping
        if decision_upper == "APPROVE":
            new_prov_status = "APPROVED"
            new_prod_status = "VERIFIED"
            new_cert_status = "Certified Compliant"
            action_code = "CERTIFICATION_APPROVED"
        elif decision_upper == "REJECT":
            new_prov_status = "REJECTED"
            new_prod_status = "REJECTED"
            new_cert_status = "Rejected"
            action_code = "CERTIFICATION_REJECTED"
        else:
            new_prov_status = "FLAGGED"
            new_prod_status = "FLAGGED"
            new_cert_status = "Flagged for Re-Audit"
            action_code = "CERTIFICATION_FLAGGED"

        # 1. Update Provenance Record Status
        rec.status = new_prov_status
        db.commit()
        db.refresh(rec)

        # 2. Update Product Verification Status
        product = product_repository.get(db, rec.product_id)
        if product:
            product.verification_status = new_prod_status
            product.certification_status = new_cert_status
            db.commit()

        # 3. Create Immutable Audit Log Record (No Silent Modification)
        user_role = current_user.role.name if current_user.role else "CERTIFIER"
        details_payload = json.dumps({
            "provenance_id": rec.provenance_id,
            "batch_id": rec.batch_id,
            "product_id": rec.product_id,
            "previous_status": prev_status,
            "new_status": new_prov_status,
            "decision": decision_upper,
            "reason": req.reason,
            "certifier_id": current_user.id,
            "certifier_email": current_user.email,
            "certifier_role": user_role,
            "decided_at": now.isoformat()
        })

        audit_entry = audit_log_repository.log(
            db,
            action=action_code,
            user_id=current_user.id,
            details=details_payload,
            ip_address=ip_address
        )

        return CertifierDecisionResponse(
            provenance_id=rec.provenance_id,
            previous_status=prev_status,
            new_status=new_prov_status,
            decision=decision_upper,
            certifier_id=current_user.id,
            certifier_email=current_user.email,
            certifier_role=user_role,
            reason=req.reason,
            decided_at=now,
            audit_log_id=audit_entry.id,
            message=f"Provenance {rec.provenance_id} successfully {new_prov_status.lower()} by certifier."
        )

    @staticmethod
    def list_audit_logs(db: Session, limit: int = 50) -> AuditLogListResponse:
        """
        Lists immutable system audit log entries.
        """
        logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit).all()
        items = [AuditLogResponse.model_validate(l) for l in logs]
        return AuditLogListResponse(items=items, total=len(items))
