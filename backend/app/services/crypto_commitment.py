import json
import hashlib
from typing import Dict, Any, Tuple


class CanonicalHasher:
    ALGORITHM_VERSION = "ECHO-SHA256-v1.0"

    @classmethod
    def build_canonical_payload(
        cls,
        provenance_id: str,
        capture_id: str,
        acoustic_fingerprint: str,
        product_name: str,
        batch_id: str,
        region: str,
        country: str,
        server_timestamp: str,
        algorithm_version: str = ALGORITHM_VERSION
    ) -> Dict[str, Any]:
        """
        Constructs the strict, deterministic canonical metadata payload.
        Omits exact GPS and non-deterministic transient fields.
        """
        return {
            "algorithm_version": algorithm_version,
            "acoustic_fingerprint": str(acoustic_fingerprint).strip(),
            "batch_id": str(batch_id).strip(),
            "capture_id": str(capture_id).strip(),
            "country": str(country).strip(),
            "product_name": str(product_name).strip(),
            "provenance_id": str(provenance_id).strip(),
            "region": str(region).strip(),
            "server_timestamp": str(server_timestamp).strip(),
        }

    @classmethod
    def compute_sha256_hash(cls, payload: Dict[str, Any]) -> str:
        """
        Computes deterministic SHA-256 digest by sorting keys and using compact formatting.
        """
        canonical_json = json.dumps(payload, sort_keys=True, separators=(',', ':'))
        return hashlib.sha256(canonical_json.encode('utf-8')).hexdigest()

    @classmethod
    def verify_commitment(cls, payload: Dict[str, Any], expected_hash: str) -> Tuple[bool, str]:
        """
        Re-computes hash and verifies against expected commitment hash.
        Returns (is_valid, computed_hash).
        """
        computed_hash = cls.compute_sha256_hash(payload)
        is_valid = (computed_hash.lower() == str(expected_hash).strip().lower())
        return is_valid, computed_hash
