
# =============================================================
# 3) app/api/controls/effective.py
# =============================================================
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List
from sqlalchemy.orm import Session

from app.database import get_db
from app.constants.scopes import is_valid_scope, normalize_scope
from app.schemas.controls.effective_control import EffectiveControlOut
from app.services.controls.effective_overlay import get_effective_controls

router = APIRouter(prefix="/effective-controls", tags=["Controls – Effective Overlay"])

@router.get("/", response_model=List[EffectiveControlOut])
def effective_controls(
    scope_type: str = Query(..., description="asset|tag|asset_group|asset_type|bu|site|entity|service|org_group"),
    scope_id: int = Query(...),
    db: Session = Depends(get_db),
):
    if not is_valid_scope(scope_type):
        raise HTTPException(400, detail=f"Unsupported scope_type '{scope_type}'")
    scope_type = normalize_scope(scope_type)
    return get_effective_controls(db, scope_type, scope_id)