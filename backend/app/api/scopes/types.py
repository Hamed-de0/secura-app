# app/api/scopes/types.py
from fastapi import APIRouter, Response
from typing import List, Literal
from pydantic import BaseModel, conint

router = APIRouter(tags=["scopes"])

ScopeType = Literal[
    "org", "entity", "bu", "service", "site",
    "asset_group", "asset_type", "tag", "asset"
]

class ScopeTypeItem(BaseModel):
    scope_type: ScopeType
    title: str
    order: conint(gt=0)

# Canonical list (no DB)
_SCOPE_TYPES: List[ScopeTypeItem] = [
    {"scope_type": "org",         "title": "Organization",    "order": 1},
    {"scope_type": "entity",      "title": "Legal Entity",    "order": 2},
    {"scope_type": "bu",          "title": "Business Unit",   "order": 3},
    {"scope_type": "service",     "title": "Service",         "order": 4},
    {"scope_type": "site",        "title": "Site / Location", "order": 5},
    {"scope_type": "asset_group", "title": "Asset Group",     "order": 6},
    {"scope_type": "asset_type",  "title": "Asset Type",      "order": 7},
    {"scope_type": "tag",         "title": "Tag",             "order": 8},
    {"scope_type": "asset",       "title": "Asset",           "order": 9},
]  # keep this the single source of truth

@router.get("/scopes/types", response_model=List[ScopeTypeItem])
def get_scope_types(response: Response):
    # cache strongly — this never changes without a deploy
    response.headers["Cache-Control"] = "public, max-age=86400, immutable"
    return _SCOPE_TYPES
