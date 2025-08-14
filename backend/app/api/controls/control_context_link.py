from fastapi import APIRouter, Depends, HTTPException, Path
from typing import List
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.controls.control_context_link import  ControlContextLinkCreate, ControlContextLinkUpdate, ControlContextLinkOut
from app.schemas.controls.control_context_effect_override import ControlContextEffectOverrideCreate, ControlContextEffectOverrideUpdate, ControlContextEffectOverrideOut
from app.crud.controls import control_context_link as crud_links
from app.crud.controls import control_context_effect_override as crud_over
from app.services.risk_analysis import calculate_risk_scores_by_context
from app.schemas.controls.control_context_link import ControlContextStatusUpdate
from app.crud.controls import control_context_link as crud


router = APIRouter(prefix="/control-context", tags=["Control Context"])

# ---- Links (implemented controls) ----
@router.post("/links", response_model=ControlContextLinkOut)
def upsert_link(payload: ControlContextLinkCreate, db: Session = Depends(get_db)):
    row = crud_links.upsert(db, payload)
    try:
        calculate_risk_scores_by_context(db, row.risk_scenario_context_id)
        db.commit()
    except Exception:
        pass
    return row

@router.put("/links/{id}", response_model=ControlContextLinkOut)
def update_link(id: int, payload: ControlContextLinkUpdate, db: Session = Depends(get_db)):
    row = crud_links.update(db, id, payload)
    if not row: raise HTTPException(status_code=404, detail="Not found")
    try:
        calculate_risk_scores_by_context(db, row.risk_scenario_context_id)
        db.commit()
    except Exception:
        pass
    return row

@router.delete("/links/{id}")
def delete_link(id: int, db: Session = Depends(get_db)):
    # fetch context id before delete to recalc
    from app.models.controls.control_context_link import ControlContextLink
    row = db.query(ControlContextLink).get(id)
    if not row: raise HTTPException(status_code=404, detail="Not found")
    ctx_id = row.risk_scenario_context_id
    ok = crud_links.delete(db, id)
    if ok:
        try:
            calculate_risk_scores_by_context(db, ctx_id)
            db.commit()
        except Exception:
            pass
    return {"deleted": ok}

@router.get("/links/by-context/{context_id}", response_model=List[ControlContextLinkOut])
def list_links_by_context(context_id: int, db: Session = Depends(get_db)):
    return crud_links.list_by_context(db, context_id)

# ---- Overrides (optional) ----
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
    if not row: raise HTTPException(status_code=404, detail="Not found")
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
    if not row: raise HTTPException(status_code=404, detail="Not found")
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

@router.patch("/{link_id}/status")
def update_status(
    link_id: int = Path(...),
    payload: ControlContextStatusUpdate = ...,
    db: Session = Depends(get_db),
):
    obj = crud.update_status(db, link_id, payload)
    if not obj:
        raise HTTPException(404, "ControlContextLink not found")
    # return a minimal view
    return {
        "id": obj.id,
        "assurance_status": obj.assurance_status,
        "implemented_at": obj.implemented_at,
        "status_updated_at": obj.status_updated_at,
        "notes": obj.notes,
    }