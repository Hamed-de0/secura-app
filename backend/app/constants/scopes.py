# =============================================
# constants/scopes.py
# One source of truth for scope types & precedence
# =============================================
from typing import Iterable, List, Tuple

# Official scope types supported by the app.
# Keep names lowercase, singular.
SCOPE_TYPES: Tuple[str, ...] = (
    "asset",
    "tag",
    "asset_group",
    "asset_type",
    "bu",          # business unit (optional)
    "site",        # location/facility (optional)
    "entity",      # legal entity/company (core)
    "service",     # shared service provider (optional)
    "org_group",   # holding/parent group (optional)
)

# Precedence from MOST specific → LEAST specific for overlay/merging.
# Later layers in this list should NOT override earlier ones by default.
# Adjust if your governance model requires a different order (e.g., site vs bu).
PRECEDENCE: Tuple[str, ...] = (
    "asset",
    "tag",
    "asset_group",
    "asset_type",
    "bu",
    "site",
    "entity",
    "service",
    "org_group",
)

# Backward-compat aliases (normalized on input)
ALIASES = {
    "org": "entity",  # legacy name used earlier
}


def is_valid_scope(scope_type: str) -> bool:
    return scope_type in SCOPE_TYPES or scope_type in ALIASES


def normalize_scope(scope_type: str) -> str:
    if scope_type in ALIASES:
        return ALIASES[scope_type]
    if scope_type not in SCOPE_TYPES:
        raise ValueError(f"Unsupported scope_type: {scope_type}. Allowed: {', '.join(SCOPE_TYPES)}")
    return scope_type


def precedence_index(scope_type: str) -> int:
    st = normalize_scope(scope_type)
    try:
        return PRECEDENCE.index(st)
    except ValueError:
        raise ValueError(f"Scope '{st}' not found in PRECEDENCE order")


def sort_scopes_by_precedence(scopes: Iterable[str]) -> List[str]:
    return sorted((normalize_scope(s) for s in scopes), key=precedence_index)


# Optional: which scopes are typically used for implementation vs reporting lenses
IMPLEMENTATION_SCOPES: Tuple[str, ...] = (
    "asset", "asset_group", "asset_type", "tag", "bu", "entity", "service", "site"
)
REPORTING_SCOPES: Tuple[str, ...] = (
    "entity", "bu", "service", "org_group", "site", "asset_type", "asset_group", "asset"
)

