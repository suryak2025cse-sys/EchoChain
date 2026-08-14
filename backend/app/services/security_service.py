import json
import logging
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.security_event import SecurityEvent
from app.models.provenance_record import ProvenanceRecord
from app.models.audio_capture import AudioCapture
from app.models.acoustic_fingerprint import AcousticFingerprint
from app.models.liveness_challenge import LivenessChallenge
from app.models.liveness_result import LivenessResult
from app.models.product import Product
from app.models.user import User

from app.repositories.security_event_repository import security_event_repository
from app.repositories.provenance_repository import provenance_repository
from app.repositories.audio_capture_repository import audio_capture_repository
from app.repositories.acoustic_repository import acoustic_repository
from app.repositories.liveness_repository import liveness_result_repository, liveness_challenge_repository
from app.repositories.product_repository import product_repository
from app.repositories.audit_log_repository import audit_log_repository
from app.services.crypto_commitment import CanonicalHasher
from app.services.supabase_client import sync_record_to_supabase
from app.schemas.security import (
    SecurityEventResponse,
    SecurityEventListResponse,
    SecurityMetricsSummary,
    SecurityScanResult
)

logger = logging.getLogger(__name__)


class SecurityService:
    @staticmethod
    def create_security_event(
        db: Session,
        event_type: str,
        risk_level: str,
        detector_name: str,
        description: str,
        evidence_json: Dict[str, Any],
        provenance_id: Optional[str] = None,
        product_id: Optional[int] = None,
        capture_id: Optional[str] = None,
        user_id: Optional[int] = None
    ) -> SecurityEvent:
        """
        Creates a new SecurityEvent, syncs to Supabase, and logs to Audit Trail.
        Prevents spamming duplicate open events for the exact same entity and event type.
        """
        # Deduplication check
        existing = security_event_repository.get_existing_open_event(
            db, event_type=event_type, provenance_id=provenance_id, capture_id=capture_id
        )
        if existing:
            # Update evidence if needed
            existing.evidence_json = evidence_json
            existing.description = description
            db.commit()
            db.refresh(existing)
            return existing

        count = db.query(SecurityEvent).count() + 1
        event_id = f"SEC-2026-{count:06d}"
        now = datetime.now(timezone.utc)

        db_obj = SecurityEvent(
            event_id=event_id,
            event_type=event_type.upper(),
            risk_level=risk_level.upper(),
            provenance_id=provenance_id,
            product_id=product_id,
            capture_id=capture_id,
            user_id=user_id,
            detector_name=detector_name,
            description=description,
            evidence_json=evidence_json,
            status="OPEN"
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)

        # Sync to Supabase
        payload = {
            "event_id": db_obj.event_id,
            "event_type": db_obj.event_type,
            "risk_level": db_obj.risk_level,
            "provenance_id": db_obj.provenance_id,
            "product_id": db_obj.product_id,
            "capture_id": db_obj.capture_id,
            "user_id": db_obj.user_id,
            "detector_name": db_obj.detector_name,
            "description": db_obj.description,
            "evidence_json": db_obj.evidence_json,
            "status": db_obj.status,
            "created_at": now.isoformat()
        }
        sync_record_to_supabase("security_events", payload)

        # Log into system audit logs
        audit_log_repository.log(
            db,
            action=f"SECURITY_THREAT_DETECTED_{db_obj.risk_level}",
            user_id=user_id,
            details=f"Threat '{event_type}' ({risk_level}) logged as {event_id}: {description[:100]}"
        )

        return db_obj

    @staticmethod
    def evaluate_capture_security(db: Session, capture_id: str, user_id: int) -> List[SecurityEvent]:
        """
        Runs real-time security detection on a specific audio capture.
        Detects: Duplicate Captures, Replayed Audio, Reused Challenges.
        """
        events = []
        capture = audio_capture_repository.get_by_capture_id(db, capture_id)
        if not capture:
            return events

        # 1. Duplicate Captures Detector
        duplicates = db.query(AudioCapture).filter(
            AudioCapture.capture_id != capture_id,
            AudioCapture.file_size == capture.file_size,
            AudioCapture.duration == capture.duration,
            AudioCapture.file_name == capture.file_name
        ).all()

        if duplicates:
            same_producer = any(d.user_id == user_id for d in duplicates)
            risk = "MEDIUM" if same_producer else "HIGH"
            dup_ids = [d.capture_id for d in duplicates]
            ev = SecurityService.create_security_event(
                db,
                event_type="DUPLICATE_CAPTURE",
                risk_level=risk,
                detector_name="DUPLICATE_CAPTURE_DETECTOR",
                description=f"Audio capture '{capture_id}' matches identical file size ({capture.file_size} B) and duration ({capture.duration} s) of existing capture(s): {', '.join(dup_ids)}.",
                evidence_json={
                    "capture_id": capture_id,
                    "matched_capture_ids": dup_ids,
                    "file_size": capture.file_size,
                    "duration": capture.duration,
                    "same_producer": same_producer
                },
                product_id=capture.product_id,
                capture_id=capture_id,
                user_id=user_id
            )
            events.append(ev)

        # 2. Replayed Audio Detector
        liveness_res = liveness_result_repository.get_by_capture_id(db, capture_id)
        if liveness_res:
            is_high_risk = liveness_res.replay_risk in ["HIGH", "CRITICAL"] or liveness_res.liveness_score < 70.0
            if is_high_risk:
                risk = "CRITICAL" if liveness_res.liveness_score < 50.0 or liveness_res.replay_risk == "CRITICAL" else "HIGH"
                ev = SecurityService.create_security_event(
                    db,
                    event_type="REPLAYED_AUDIO",
                    risk_level=risk,
                    detector_name="REPLAY_RISK_DETECTOR",
                    description=f"Acoustic liveness evaluation flagged high replay risk ({liveness_res.replay_risk}) with low score ({liveness_res.liveness_score:.1f}/100) for capture '{capture_id}'.",
                    evidence_json={
                        "capture_id": capture_id,
                        "liveness_score": liveness_res.liveness_score,
                        "replay_risk": liveness_res.replay_risk,
                        "snr_db": liveness_res.snr_db,
                        "high_freq_ratio": liveness_res.high_freq_ratio,
                        "clipping_factor": liveness_res.clipping_factor
                    },
                    product_id=capture.product_id,
                    capture_id=capture_id,
                    user_id=user_id
                )
                events.append(ev)

        return events

    @staticmethod
    def evaluate_provenance_security(db: Session, provenance_id: str) -> List[SecurityEvent]:
        """
        Runs real-time security detection on a sealed/created provenance record.
        Detects: Hash Mismatch, Modified Metadata, Suspicious Provenance Reuse, Invalid Blockchain Proof.
        """
        events = []
        rec = provenance_repository.get_by_provenance_id(db, provenance_id)
        if not rec:
            return events

        product = product_repository.get(db, rec.product_id)

        # 1. Hash Mismatch Detector
        meta = rec.metadata_json or {}
        canonical_payload = meta.get("canonical_payload")
        if not canonical_payload:
            canonical_payload = CanonicalHasher.build_canonical_payload(
                provenance_id=rec.provenance_id,
                capture_id=rec.capture_id,
                acoustic_fingerprint=rec.fingerprint,
                product_name=product.product_name if product else "Unknown Crop",
                batch_id=rec.batch_id,
                region=rec.region,
                country=rec.country,
                server_timestamp=meta.get("server_timestamp", str(rec.created_at)),
                algorithm_version="ECHO-SHA256-v1.0"
            )

        is_valid, computed_hash = CanonicalHasher.verify_commitment(canonical_payload, rec.provenance_hash)
        if not is_valid:
            ev = SecurityService.create_security_event(
                db,
                event_type="HASH_MISMATCH",
                risk_level="CRITICAL",
                detector_name="HASH_INTEGRITY_CHECKER",
                description=f"Cryptographic hash mismatch on provenance record '{provenance_id}'. Stored hash: {rec.provenance_hash[:16]}... vs Computed: {computed_hash[:16]}...",
                evidence_json={
                    "provenance_id": provenance_id,
                    "stored_hash": rec.provenance_hash,
                    "computed_hash": computed_hash,
                    "canonical_payload": canonical_payload
                },
                provenance_id=provenance_id,
                product_id=rec.product_id,
                capture_id=rec.capture_id,
                user_id=rec.producer_id
            )
            events.append(ev)

        # 2. Modified Metadata Detector
        if meta.get("product"):
            orig_prod = meta["product"]
            current_region = product.region if product else rec.region
            current_country = product.country if product else rec.country
            if orig_prod.get("region") != current_region or orig_prod.get("country") != current_country:
                ev = SecurityService.create_security_event(
                    db,
                    event_type="MODIFIED_METADATA",
                    risk_level="HIGH",
                    detector_name="METADATA_DRIFT_DETECTOR",
                    description=f"Post-seal metadata discrepancy detected for provenance '{provenance_id}'. Region/Country drifted from '{orig_prod.get('region')}, {orig_prod.get('country')}' to '{current_region}, {current_country}'.",
                    evidence_json={
                        "provenance_id": provenance_id,
                        "original_metadata": orig_prod,
                        "current_region": current_region,
                        "current_country": current_country
                    },
                    provenance_id=provenance_id,
                    product_id=rec.product_id,
                    capture_id=rec.capture_id,
                    user_id=rec.producer_id
                )
                events.append(ev)

        # 3. Suspicious Provenance Reuse Detector
        same_fingerprint_recs = db.query(ProvenanceRecord).filter(
            ProvenanceRecord.provenance_id != provenance_id,
            ProvenanceRecord.fingerprint == rec.fingerprint
        ).all()
        if same_fingerprint_recs:
            different_producers = any(r.producer_id != rec.producer_id for r in same_fingerprint_recs)
            different_regions = any(r.region != rec.region for r in same_fingerprint_recs)
            risk = "CRITICAL" if (different_producers or different_regions) else "HIGH"
            matched_ids = [r.provenance_id for r in same_fingerprint_recs]

            ev = SecurityService.create_security_event(
                db,
                event_type="SUSPICIOUS_PROVENANCE_REUSE",
                risk_level=risk,
                detector_name="PROVENANCE_REUSE_ANALYZER",
                description=f"Acoustic fingerprint '{rec.fingerprint[:16]}...' is reused across multiple provenance records ({', '.join(matched_ids)}). Different producer or region detected.",
                evidence_json={
                    "provenance_id": provenance_id,
                    "matched_provenance_ids": matched_ids,
                    "fingerprint": rec.fingerprint,
                    "different_producers": different_producers,
                    "different_regions": different_regions
                },
                provenance_id=provenance_id,
                product_id=rec.product_id,
                capture_id=rec.capture_id,
                user_id=rec.producer_id
            )
            events.append(ev)

        # 4. Invalid Blockchain Proof Detector
        if rec.is_anchored or rec.tx_hash:
            tx = rec.tx_hash or ""
            is_valid_tx = tx.startswith("0x") and len(tx) >= 64
            if not is_valid_tx:
                ev = SecurityService.create_security_event(
                    db,
                    event_type="INVALID_BLOCKCHAIN_PROOF",
                    risk_level="HIGH",
                    detector_name="BLOCKCHAIN_ANCHOR_VERIFIER",
                    description=f"Invalid EVM Polygon transaction hash format '{tx}' recorded on anchored provenance record '{provenance_id}'.",
                    evidence_json={
                        "provenance_id": provenance_id,
                        "tx_hash": tx,
                        "network": rec.network,
                        "contract_address": rec.contract_address
                    },
                    provenance_id=provenance_id,
                    product_id=rec.product_id,
                    capture_id=rec.capture_id,
                    user_id=rec.producer_id
                )
                events.append(ev)

        return events

    @staticmethod
    def run_full_security_audit(db: Session) -> SecurityScanResult:
        """
        Scans all records in system and generates security threat events for any violations.
        """
        captures = audio_capture_repository.get_multi(db, limit=500)
        provenances = provenance_repository.get_multi(db, limit=500)
        challenges = liveness_challenge_repository.get_multi(db, limit=500)

        generated_events: List[SecurityEvent] = []

        # 1. Evaluate all captures
        for cap in captures:
            evs = SecurityService.evaluate_capture_security(db, cap.capture_id, cap.user_id)
            generated_events.extend(evs)

        # 2. Evaluate all provenance records
        for prov in provenances:
            evs = SecurityService.evaluate_provenance_security(db, prov.provenance_id)
            generated_events.extend(evs)

        # 3. Evaluate reused liveness challenges
        for ch in challenges:
            if ch.is_used:
                # Check if challenge token was reused elsewhere
                reuses = db.query(LivenessChallenge).filter(
                    LivenessChallenge.id != ch.id,
                    LivenessChallenge.challenge_token == ch.challenge_token
                ).all()
                if reuses:
                    ev = SecurityService.create_security_event(
                        db,
                        event_type="REUSED_CHALLENGE",
                        risk_level="MEDIUM",
                        detector_name="CHALLENGE_NONCE_VERIFIER",
                        description=f"Liveness challenge token '{ch.challenge_token[:12]}...' was generated or submitted multiple times across sessions.",
                        evidence_json={
                            "challenge_id": ch.challenge_id,
                            "challenge_token": ch.challenge_token,
                            "reuse_count": len(reuses)
                        },
                        user_id=ch.user_id
                    )
                    generated_events.append(ev)

        items = [SecurityEventResponse.model_validate(e) for e in generated_events]
        msg = f"Security audit completed. Scanned {len(provenances)} provenances, {len(captures)} captures, and {len(challenges)} challenges. Found {len(generated_events)} security threat indicator(s)."

        audit_log_repository.log(
            db,
            action="SYSTEM_SECURITY_AUDIT_EXECUTED",
            details=msg
        )

        return SecurityScanResult(
            scanned_records=len(provenances),
            scanned_captures=len(captures),
            scanned_challenges=len(challenges),
            events_generated=len(generated_events),
            new_events=items,
            summary_message=msg
        )

    @staticmethod
    def get_security_metrics(db: Session) -> SecurityMetricsSummary:
        """
        Aggregates summary statistics for fraud & security dashboard.
        """
        all_events = security_event_repository.get_multi(db, limit=1000)

        total_events = len(all_events)
        open_events = sum(1 for e in all_events if e.status == "OPEN")
        resolved_events = sum(1 for e in all_events if e.status == "RESOLVED")
        false_positives = sum(1 for e in all_events if e.status == "FALSE_POSITIVE")

        by_risk = {"LOW": 0, "MEDIUM": 0, "HIGH": 0, "CRITICAL": 0}
        by_type: Dict[str, int] = {}

        for e in all_events:
            r = e.risk_level.upper()
            by_risk[r] = by_risk.get(r, 0) + 1

            t = e.event_type.upper()
            by_type[t] = by_type.get(t, 0) + 1

        return SecurityMetricsSummary(
            total_events=total_events,
            open_events=open_events,
            resolved_events=resolved_events,
            false_positives=false_positives,
            by_risk_level=by_risk,
            by_event_type=by_type
        )

    @staticmethod
    def resolve_event(
        db: Session,
        event_id: str,
        current_user: User,
        target_status: str,
        resolution_notes: str
    ) -> SecurityEventResponse:
        """
        Resolves a security event with administrator notes and audit log entry.
        """
        ev = security_event_repository.get_by_event_id(db, event_id)
        if not ev:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Security event '{event_id}' not found.")

        valid_statuses = ["RESOLVED", "FALSE_POSITIVE", "INVESTIGATING", "OPEN"]
        if target_status.upper() not in valid_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status '{target_status}'. Must be one of {valid_statuses}."
            )

        now = datetime.now(timezone.utc)
        ev.status = target_status.upper()
        ev.resolved_by_id = current_user.id
        ev.resolved_at = now
        ev.resolution_notes = resolution_notes

        db.commit()
        db.refresh(ev)

        audit_log_repository.log(
            db,
            action=f"SECURITY_EVENT_{ev.status}",
            user_id=current_user.id,
            details=f"Security event {event_id} status updated to {ev.status} by {current_user.email}. Notes: {resolution_notes}"
        )

        return SecurityEventResponse.model_validate(ev)
