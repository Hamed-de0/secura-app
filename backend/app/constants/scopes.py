# =============================================
# constants/scopes.py
# One source of truth for scope types & precedence
# =============================================
# app/constants/scopes.py
from typing import Iterable, List, Tuple

SCOPE_TYPES: Tuple[str, ...] = (
    "asset", "tag", "asset_group", "asset_type",
    "bu", "site", "entity", "service", "org_group",
)

PRECEDENCE: Tuple[str, ...] = (
    "asset", "tag", "asset_group", "asset_type",
    "bu", "site", "entity", "service", "org_group",
)

ALIASES = {"org": "entity"}

def is_valid_scope(st: str) -> bool:
    return st in SCOPE_TYPES or st in ALIASES

def normalize_scope(st: str) -> str:
    if st in ALIASES: return ALIASES[st]
    if st not in SCOPE_TYPES:
        raise ValueError(f"Unsupported scope_type: {st}")
    return st
