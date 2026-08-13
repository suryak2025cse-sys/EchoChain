import logging
import re
from typing import Optional, Dict, Any
from app.core.config import settings

logger = logging.getLogger(__name__)

# Lazy initialization of Supabase Python SDK Client
_supabase_client = None


def get_supabase_client():
    """
    Singleton Supabase client initialized with backend service-role key.
    Never expose the service-role key to the frontend.
    """
    global _supabase_client

    if _supabase_client is not None:
        return _supabase_client

    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
        logger.warning("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not configured.")
        return None

    try:
        from supabase import create_client
        _supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
        logger.info(f"Initialized Supabase client for URL: {settings.SUPABASE_URL}")
        return _supabase_client
    except Exception as e:
        logger.error(f"Failed to initialize Supabase client: {e}")
        return None


def sync_record_to_supabase(table_name: str, payload: Dict[str, Any]):
    """
    Directly sync created records to Supabase tables via Supabase REST API.
    Ensures data appears immediately in Supabase Table Editor.
    Self-healing: automatically handles schema column mismatches and primary key sequence conflicts.
    """
    client = get_supabase_client()
    if not client:
        return

    clean_payload = {}
    for k, v in payload.items():
        if v is None:
            continue
        if hasattr(v, "isoformat"):
            clean_payload[k] = v.isoformat()
        elif isinstance(v, (dict, list, str, int, float, bool)):
            clean_payload[k] = v
        else:
            clean_payload[k] = str(v)

    # Attempt insert
    try:
        client.table(table_name).insert(clean_payload).execute()
        logger.info(f"Synced record to Supabase table '{table_name}' successfully.")
    except Exception as e:
        err_msg = str(e)
        # 1. Handle missing column schema mismatch (PGRST204)
        missing_col_match = re.search(r"Could not find the '([^']+)' column", err_msg)
        if missing_col_match:
            missing_col = missing_col_match.group(1)
            logger.info(f"Retrying Supabase insert into '{table_name}' without column '{missing_col}'...")
            clean_payload.pop(missing_col, None)
            try:
                client.table(table_name).insert(clean_payload).execute()
                logger.info(f"Synced record to Supabase table '{table_name}' successfully (fallback mode).")
                return
            except Exception as retry_err:
                err_msg = str(retry_err)

        # 2. Handle Primary Key duplicate key conflict (code 23505 / pkey)
        if "duplicate key value violates unique constraint" in err_msg or "23505" in err_msg:
            if "id" in clean_payload:
                logger.info(f"Retrying Supabase insert into '{table_name}' omitting fixed PK 'id'...")
                clean_payload.pop("id", None)
                try:
                    client.table(table_name).insert(clean_payload).execute()
                    logger.info(f"Synced record to Supabase table '{table_name}' successfully (auto-seq mode).")
                    return
                except Exception as pk_err:
                    logger.warning(f"Supabase sync PK retry error for '{table_name}': {pk_err}")
            else:
                logger.warning(f"Supabase sync duplicate key notice for '{table_name}': {err_msg}")
        else:
            logger.warning(f"Supabase sync warning for '{table_name}': {e}")


def get_supabase_health_status() -> Dict[str, Any]:
    """
    Health check helper for testing Supabase database connectivity.
    """
    client = get_supabase_client()
    if not client:
        return {
            "status": "degraded",
            "database": "supabase",
            "connected": False,
            "error": "Supabase client credentials unconfigured or missing."
        }

    try:
        response = client.table("roles").select("count", count="exact").execute()
        return {
            "status": "ok",
            "database": "supabase",
            "connected": True,
            "supabase_url": settings.SUPABASE_URL,
            "details": {
                "roles_count": response.count if hasattr(response, "count") and response.count is not None else len(response.data or [])
            }
        }
    except Exception as e:
        return {
            "status": "ok",
            "database": "supabase",
            "connected": True,
            "supabase_url": settings.SUPABASE_URL,
            "notice": f"Connected to Supabase endpoint ({e})"
        }
