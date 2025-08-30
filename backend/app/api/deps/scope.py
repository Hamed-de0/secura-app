from typing import Tuple, Optional
from fastapi import Query

from app.core.defaults import DEFAULT_SCOPE_TYPE, DEFAULT_SCOPE_ID

def resolve_scope(
    scope_type: Optional[str] = Query(None, description="Scope type (e.g., org, asset_group, asset_type, tag, asset)"),
    scope_id: Optional[int]  = Query(None, description="Scope id"),
) -> Tuple[str, int]:
    """
    Returns a (scope_type, scope_id) tuple, defaulting to org/1 when not provided.
    """
    return scope_type or DEFAULT_SCOPE_TYPE, scope_id or DEFAULT_SCOPE_ID
