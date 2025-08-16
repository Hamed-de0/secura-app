# app/constants/scopes.py
SCOPE_TYPES = {
    "asset", "tag", "asset_group", "asset_type",
    "bu", "site", "entity", "service", "org_group"
}

ALIASES = {
    "assets": "asset",
    "assettype": "asset_type", "asset-type": "asset_type", "assetType": "asset_type",
    "assetgroup": "asset_group", "asset-group": "asset_group", "assetGroup": "asset_group",
    "business_unit": "bu", "businessunit": "bu", "business-unit": "bu",
    "organization_group": "org_group", "orggroup": "org_group", "group": "org_group",
    "organisation_group": "org_group",
    "company": "entity", "org": "entity",
    "location": "site",
    "service_id": "service",
    # keep identity mappings too
}
def normalize_scope(s: str) -> str:
    if not s:
        return s
    k = str(s).strip().lower().replace(" ", "_").replace("-", "_")
    return ALIASES.get(k, k)

def is_valid_scope(s: str) -> bool:
    return normalize_scope(s) in SCOPE_TYPES

# most-specific → least-specific
PRECEDENCE = [
    "asset", "tag", "asset_group", "asset_type",
    "bu", "site", "entity", "service", "org_group",
]
