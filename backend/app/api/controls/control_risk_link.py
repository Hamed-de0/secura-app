from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.schemas.controls.control_risk_link import ControlRiskLinkCreate, ControlRiskLinkRead, ControlRiskLinkUpdate
from app.crud.controls.control_risk_link import (
create_control_risk_link,
    get_control_risk_links,
    get_links_by_risk_scenario,
    get_links_by_risk_control,
    update_control_risk_link,
    delete_control_risk_link,
    upsert_control_risk_link
)
from app.database import get_db
from typing import List, Optional
from app.models.controls.control_effect_rating import ControlEffectRating
from app.models.controls.control_context_link import ControlContextLink
from app.models.controls.control import Control
from pydantic import BaseModel


router = APIRouter(prefix="/control-risk-links", tags=["Control-Risk Links"])


@router.post("/", response_model=ControlRiskLinkRead)
def create_link(link: ControlRiskLinkCreate, db: Session = Depends(get_db)):
    return upsert_control_risk_link(db, link)


@router.get("/", response_model=List[ControlRiskLinkRead])
def read_all_links(db: Session = Depends(get_db)):
    return get_control_risk_links(db)


@router.get("/by-scenario/{scenario_id}", response_model=List[ControlRiskLinkRead])
def read_links_by_risk_scenario(scenario_id: int, db: Session = Depends(get_db)):
    return get_links_by_risk_scenario(db, scenario_id)

@router.get("/by-control/{control_id}", response_model=List[ControlRiskLinkRead])
def read_links_by_risk_control(control_id: int, db: Session = Depends(get_db)):
    return get_links_by_risk_control(db, control_id)


class ControlSuggestionOut(BaseModel):
    control_id: int
    code: Optional[str] = None
    title: Optional[str] = None
    score: Optional[int] = None  # max domain score used for ranking


@router.get("/by-scenario/{scenario_id}/suggest", response_model=List[ControlSuggestionOut])
def suggest_controls_for_scenario(
    scenario_id: int,
    context_id: Optional[int] = Query(None, description="Exclude controls already linked to this context"),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Suggest controls for a scenario based on ControlEffectRating.

    Security/Privacy:
      - Read-only; returns minimal control identity fields and an aggregate score.
      - If context_id provided, filters out controls already linked to that specific context to prevent duplicate suggestions.
    """
    # Base: controls with positive effect score for the scenario, aggregate by control with max(score)
    q = (
        db.query(
            ControlEffectRating.control_id.label("control_id"),
            func.max(ControlEffectRating.score).label("score")
        )
        .filter(ControlEffectRating.risk_scenario_id == scenario_id, ControlEffectRating.score > 0)
        .group_by(ControlEffectRating.control_id)
    )

    # Exclude already linked to the given context
    if context_id is not None:
        sub = (
            db.query(ControlContextLink.control_id)
            .filter(ControlContextLink.risk_scenario_context_id == context_id)
            .subquery()
        )
        q = q.filter(~ControlEffectRating.control_id.in_(sub))

    # Order by score desc, join Control for display fields, and limit
    q = (
        q.order_by(func.max(ControlEffectRating.score).desc())
        .limit(limit)
        .subquery()
    )

    rows = (
        db.query(
            q.c.control_id,
            q.c.score,
            Control.reference_code.label("code"),
            Control.title_en.label("title_en"),
            Control.title_de.label("title_de"),
        )
        .join(Control, Control.id == q.c.control_id)
        .all()
    )

    out: List[ControlSuggestionOut] = []
    for r in rows:
        title = r.title_en or r.title_de
        out.append(ControlSuggestionOut(control_id=r.control_id, code=r.code, title=title, score=int(r.score or 0)))
    return out


@router.put("/{link_id}", response_model=ControlRiskLinkRead)
def update_link(link_id: int, update: ControlRiskLinkUpdate, db: Session = Depends(get_db)):
    updated = update_control_risk_link(db, link_id, update)
    if not updated:
        raise HTTPException(status_code=404, detail="Link not found")
    return updated


@router.delete("/{link_id}")
def delete_link(link_id: int, db: Session = Depends(get_db)):
    success = delete_control_risk_link(db, link_id)
    if not success:
        raise HTTPException(status_code=404, detail="Link not found")
    return {"detail": "Deleted"}
