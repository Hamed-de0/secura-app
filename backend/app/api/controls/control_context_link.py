from fastapi import APIRouter, Depends, HTTPException, Path, Query
from typing import List, Optional
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.controls.control_context_link import (
    ControlContextLinkCreate,
    ControlContextLinkUpdate,
    ControlContextLinkOut,
    ControlContextStatusUpdate,
)
from app.schemas.controls.control_context_effect_override import (
    ControlContextEffectOverrideCreate,
    ControlContextEffectOverrideUpdate,
    ControlContextEffectOverrideOut,
)
from app.crud.controls import control_context_effect_override as crud_over
from app.services.risk_analysis import calculate_risk_scores_by_context
from app.crud.controls.control_context_link import ControlContextLinkCRUD as ccl_crud
from app.models.controls.control_context_link import ControlContextLink as CCLModel

router = APIRouter(prefix="/control-context", tags=["Control Context"])

# -------------------------------------------------------------
# Links (implemented controls) – risk-linked OR scope-only
# -------------------------------------------------------------
@router.post("/links", response_model=ControlContextLinkOut)
def upsert_link(payload: ControlContextLinkCreate, db: Session = Depends(get_db)):
    """Create-or-update a control link.

    New model supports two targets:
      1) risk_scenario_context_id (explicit risk treatment), OR
      2) scope_type + scope_id (baseline/company/service/etc.).

    Behavior:
      - Try create; if a 409 duplicate exists, update that row instead (idempotent upsert).
      - Trigger risk score recalculation only when tied to a risk context.
    """
    # Attempt create first
    try:
        row = ccl_crud.create(db, payload)
    except HTTPException as e:
        if e.status_code != 409:
            raise
        # Find the existing duplicate and update it (UPSERT semantics)
        data = payload.dict(exclude_unset=True, by_alias=True)
        rsc_id: Optional[int] = data.get("risk_scenario_context_id")
        scope_type: Optional[str] = data.get("scope_type")
        scope_id: Optional[int] = data.get("scope_id")
        control_id: int = data["control_id"]

        q = db.query(CCLModel).filter(CCLModel.control_id == control_id)
        if rsc_id is not None:
            q = q.filter(CCLModel.risk_scenario_context_id == rsc_id)
        else:
            q = q.filter(
                CCLModel.risk_scenario_context_id.is_(None),
                CCLModel.scope_type == scope_type,
                CCLModel.scope_id == scope_id,
            )
        existing = q.first()
        if not existing:
            # Shouldn't happen, but bubble original 409
            raise
        row = ccl_crud.update(db, existing.id, ControlContextLinkUpdate(**data))

    # Recalculate risk scores ONLY if tied to a risk context
    try:
        if row.risk_scenario_context_id:
            calculate_risk_scores_by_context(db, row.risk_scenario_context_id)
            db.commit()
    except Exception:
        pass
    return row


@router.put("/links/{id}", response_model=ControlContextLinkOut)
def update_link(id: int, payload: ControlContextLinkUpdate, db: Session = Depends(get_db)):
    row = ccl_crud.update(db, id, payload)
    if not row:
        raise HTTPException(status_code=404, detail="Not found")
    try:
        if row.risk_scenario_context_id:
            calculate_risk_scores_by_context(db, row.risk_scenario_context_id)
            db.commit()
    except Exception:
        pass
    return row


@router.delete("/links/{id}")
def delete_link(id: int, db: Session = Depends(get_db)):
    row = db.query(CCLModel).get(id)
    if not row:
        raise HTTPException(status_code=404, detail="Not found")
    ctx_id = row.risk_scenario_context_id

    # perform delete
    ccl_crud.delete(db, id)

    try:
        if ctx_id:
            calculate_risk_scores_by_context(db, ctx_id)
            db.commit()
    except Exception:
        pass
    return {"deleted": True}


@router.get("/links/by-context/{context_id}", response_model=List[ControlContextLinkOut])
def list_links_by_context(context_id: int, db: Session = Depends(get_db)):
    return ccl_crud.list(db, risk_scenario_context_id=context_id)


@router.get("/links/by-scope", response_model=List[ControlContextLinkOut])
def list_links_by_scope(
    scope_type: str = Query(..., description="e.g., entity|service|asset|asset_type|asset_group|tag|bu|site|org_group"),
    scope_id: int = Query(...),
    control_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    """List links implemented directly at a scope (not via risk context)."""
    return ccl_crud.list(db, scope_type=scope_type, scope_id=scope_id, control_id=control_id)


@router.get("/links", response_model=List[ControlContextLinkOut])
def list_links(
    risk_scenario_context_id: Optional[int] = Query(None),
    scope_type: Optional[str] = Query(None),
    scope_id: Optional[int] = Query(None),
    control_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    """Flexible list endpoint covering both risk-linked and scope-only links."""
    return ccl_crud.list(db, risk_scenario_context_id, scope_type, scope_id, control_id)


# -------------------------------------------------------------
# Overrides (optional) – still tied to risk contexts
# -------------------------------------------------------------
@router.post("/overrides", response_model=ControlContextEffectOverrideOut)
def upsert_override(payload: ControlContextEffectOverrideCreate, db: Session = Depends(get_db)):
    row = crud_over.upsert(db, payload)
    try:
        calculate_risk_scores_by_context(db, row.risk_scenario_context_id)
        db.commit()
    except Exception:
        pass
    return row


@router.put("/overrides/{id}", response_model=ControlContextEffectOverrideOut)
def update_override(id: int, payload: ControlContextEffectOverrideUpdate, db: Session = Depends(get_db)):
    row = crud_over.update(db, id, payload)
    if not row:
        raise HTTPException(status_code=404, detail="Not found")
    try:
        calculate_risk_scores_by_context(db, row.risk_scenario_context_id)
        db.commit()
    except Exception:
        pass
    return row


@router.delete("/overrides/{id}")
def delete_override(id: int, db: Session = Depends(get_db)):
    from app.models.controls.control_context_effect_override import ControlContextEffectOverride
    row = db.query(ControlContextEffectOverride).get(id)
    if not row:
        raise HTTPException(status_code=404, detail="Not found")
    ctx_id = row.risk_scenario_context_id
    ok = crud_over.delete(db, id)
    if ok:
        try:
            calculate_risk_scores_by_context(db, ctx_id)
            db.commit()
        except Exception:
            pass
    return {"deleted": ok}


@router.get("/overrides/by-context/{context_id}", response_model=List[ControlContextEffectOverrideOut])
def list_overrides_by_context(context_id: int, db: Session = Depends(get_db)):
    return crud_over.list_by_context(db, context_id)


# -------------------------------------------------------------
# PATCH status – works for both risk-linked and scope-only links
# -------------------------------------------------------------
@router.patch("/{link_id}/status")
def update_status(
    link_id: int = Path(...),
    payload: ControlContextStatusUpdate = ...,
    db: Session = Depends(get_db),
):
    # Map the status payload onto a generic update
    update_payload = ControlContextLinkUpdate(
        assurance_status=payload.assurance_status,
        implemented_at=payload.implemented_at,
        notes=payload.notes,
    )
    obj = ccl_crud.update(db, link_id, update_payload)
    if not obj:
        raise HTTPException(404, "ControlContextLink not found")

    try:
        if obj.risk_scenario_context_id:
            calculate_risk_scores_by_context(db, obj.risk_scenario_context_id)
            db.commit()
    except Exception:
        pass

    return {
        "id": obj.id,
        "assurance_status": obj.assurance_status,
        "implemented_at": obj.implemented_at,
        "status_updated_at": obj.status_updated_at,
        "notes": obj.notes,
    }
