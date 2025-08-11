from typing import Dict, Any, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, asc
from app.models.risks.risk_scenario_context import RiskScenarioContext
from app.models.risks.risk_scenario import RiskScenario
from app.models.risks.risk_score import RiskScore
from app.models.assets.asset import Asset, AssetTag, AssetGroup, AssetType


def _scope_of(c: RiskScenarioContext) -> str:
    if c.asset_id: return "asset"
    if c.asset_tag_id: return "tag"
    if c.asset_group_id: return "group"
    if c.asset_type_id: return "type"
    return "type"

def _pack_impacts(c: RiskScenarioContext) -> Dict[str, int]:
    vals = [r.score for r in (c.impact_ratings or [])[:5]]
    vals += [0] * (5 - len(vals))
    return {"C": vals[0], "I": vals[1], "A": vals[2], "L": vals[3], "R": vals[4]}

def list_contexts(
    db: Session,
    *,
    offset: int = 0,
    limit: int = 25,
    sort_by: str = "updated_at",
    sort_dir: str = "desc",
    scope: str = "all",
    status: str = "all",
    search: str = "",
    asset_id: int = None,
    asset_type_id: int = None,
):
    q = db.query(RiskScenarioContext)\
          .join(RiskScenario)\
          .outerjoin(RiskScore, RiskScore.risk_scenario_context_id == RiskScenarioContext.id)\
          .outerjoin(Asset, Asset.id == RiskScenarioContext.asset_id)

    # Filters
    if scope in ("asset","tag","group","type"):
        col = {
            "asset": RiskScenarioContext.asset_id,
            "tag": RiskScenarioContext.asset_tag_id,
            "group": RiskScenarioContext.asset_group_id,
            "type": RiskScenarioContext.asset_type_id,
        }[scope]
        q = q.filter(col.isnot(None))
    if status != "all":
        q = q.filter(RiskScenarioContext.status == status)
    if asset_id is not None:
        q = q.filter(RiskScenarioContext.asset_id == asset_id)
    if asset_type_id is not None:
        q = q.filter(RiskScenarioContext.asset_type_id == asset_type_id)
    if search:
        like = f"%{search.lower()}%"
        # Search on scenario title (extend later)
        q = q.filter(func.lower(func.coalesce(RiskScenario.title_en, "")) .like(like))

    total = q.count()

    # Sorting
    sort_map = {
        "updated_at": RiskScenarioContext.updated_at,
        "residual": RiskScore.residual_score,
        "initial": RiskScore.initial_score,
        "likelihood": RiskScenarioContext.likelihood,
        "scenario_title": RiskScenario.title_en,
        "asset_name": Asset.name,
        "scope": RiskScenarioContext.asset_type_id,  # placeholder; refined later
    }
    order_col = sort_map.get(sort_by, RiskScenarioContext.updated_at)
    order = desc(order_col) if sort_dir.lower() == "desc" else asc(order_col)

    rows: List[RiskScenarioContext] = q.order_by(order).offset(offset).limit(limit).all()

    items = []
    for c in rows:
        scope_str = _scope_of(c)
        scope_name = None
        asset_name = None
        asset_id_val = None
        if scope_str == "asset" and c.asset:
            scope_name = c.asset.name; asset_name = c.asset.name; asset_id_val = c.asset.id
        elif scope_str == "tag" and c.asset_tag:
            scope_name = c.asset_tag.name
        elif scope_str == "group" and c.asset_group:
            scope_name = c.asset_group.name
        elif scope_str == "type" and c.asset_type:
            scope_name = c.asset_type.name

        score = c.score
        initial = int(getattr(score, "inherent_score", 0) or 0) or 50
        residual = int(getattr(score, "residual_score", 0) or 0) or 25
        trend = [{"x": i, "y": 40 + ((i * 3) % 12)} for i in range(12)]  # placeholder

        items.append({
            "contextId": c.id,
            "scenarioId": c.risk_scenario_id,
            "scenarioTitle": getattr(c.risk_scenario, "title_en", None) or f"Scenario #{c.risk_scenario_id}",
            "scope": scope_str,
            "scopeName": scope_name,
            "assetId": asset_id_val,
            "assetName": asset_name,
            "owner": "Unassigned",         # placeholder
            "ownerInitials": "?",
            "status": c.status or "Open",
            "likelihood": int(c.likelihood or 0),
            "impacts": _pack_impacts(c),
            "initial": initial,
            "residual": residual,
            "trend": trend,
            "controls": { "implemented": 0, "total": 0, "recommended": [], "implementedList": [] },
            "evidence": { "ok": 0, "warn": 0 },
            "updatedAt": getattr(c, "updated_at", None).isoformat() if getattr(c, "updated_at", None) else None,
        })

    return {"total": total, "items": items}
