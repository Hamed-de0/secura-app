from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Dict

from sympy.multipledispatch.dispatcher import source

from app.database import get_db
from app.schemas.risks.risk_effective import RiskEffectiveItem, ControlsOut, EvidenceOut, SourceOut
from app.models.assets.asset import Asset
from app.models.assets.asset_type import AssetType
from app.models.risks.risk_scenario_context import RiskScenarioContext
from app.models.risks.risk_scenario import RiskScenario
from app.models.risks.risk_score import RiskScore, RiskScoreHistory
from app.models.controls.control_context_link import ControlContextLink
from app.services.policy.resolver import resolve_appetite, compute_rag, get_required_controls, build_compliance_chips


router = APIRouter(prefix="/assets", tags=["Risks (Effective)"])

# helper to map domain scores into {C,I,A,L,R}; placeholder if unknown
def pack_impacts(context: RiskScenarioContext) -> Dict[str, int]:
    # try to read real domain scores if present, else fallback demo values
    if getattr(context, "impact_ratings", None):
        # naive pack by order: first five become C,I,A,L,R (adjust later with your real domains)
        vals = [r.score for r in context.impact_ratings[:5]]
        vals += [0] * (5 - len(vals))
        return {"C": vals[0], "I": vals[1], "A": vals[2], "L": vals[3], "R": vals[4]}
    return {"C": 4, "I": 4, "A": 3, "L": 3, "R": 2}  # demo default

def scope_of(ctx: RiskScenarioContext) -> str:
    if ctx.asset_id: return "asset"
    if ctx.asset_tag_id: return "tag"
    if ctx.asset_group_id: return "group"
    if ctx.asset_type_id: return "type"
    return "type"

def control_display_name(c) -> str:
    code  = getattr(c, "reference_code", None) or getattr(c, "code", None)
    control_source = getattr(c, "control_source", None)
    title = (
        getattr(c, "title_en", None)
        or getattr(c, "title", None)
        or getattr(c, "name", None)
        or f"Control #{getattr(c, 'id', '')}"
    )
    return f"{control_source} — {code} — {title}" if code else title

@router.get("/{asset_id}/risks", response_model=List[RiskEffectiveItem])
def get_effective_risks_for_asset(
    asset_id: int,
    view: str = Query("effective", regex="^(effective|all)$"),
    days: int = 90,
    db: Session = Depends(get_db),
):
    asset = db.query(Asset).get(asset_id)
    if not asset:
        raise HTTPException(404, "Asset not found")

    # gather candidate contexts (types-first world; add tags/groups later)
    q = db.query(RiskScenarioContext).filter(
        (RiskScenarioContext.asset_id == asset.id) |
        (RiskScenarioContext.asset_type_id == asset.type_id)
    ).join(RiskScenario)

    contexts = q.all()
    if not contexts:
        return []

    # group by scenario_id
    by_scenario: Dict[int, List[RiskScenarioContext]] = {}
    for c in contexts:
        by_scenario.setdefault(c.risk_scenario_id, []).append(c)

    results: List[RiskEffectiveItem] = []

    for scn_id, ctxs in by_scenario.items():
        # pick "primary" by specificity: asset > tag > group > type
        prio = {"asset": 3, "tag": 2, "group": 1, "type": 0}
        primary = sorted(ctxs, key=lambda x: prio[scope_of(x)], reverse=True)[0]

        scenario: RiskScenario = primary.risk_scenario
        scenario_title = getattr(scenario, "title", None) or getattr(scenario, "title_en", None) or getattr(scenario, "title_de", None) or f"Scenario #{scenario.id}"

        # try reading real score
        score: RiskScore = getattr(primary, "score", None)
        initial = int(getattr(score, "inherent_score", 0) or 0)
        residual = int(getattr(score, "residual_score", 0) or 0)

        # trend = last N residuals (fallback to demo points)
        hist = db.query(RiskScoreHistory)\
                 .filter(RiskScoreHistory.risk_scenario_context_id == primary.id)\
                 .order_by(RiskScoreHistory.created_at.desc())\
                 .limit(days).all()
        if hist:
            trend = [{"x": i, "y": int(h.residual_score or 0)} for i, h in enumerate(reversed(hist))]
        else:
            # static demo trend
            trend = [{"x": i, "y": 40 + ((i * 3) % 12)} for i in range(16)]

        # sources (all contributing contexts for this scenario on this asset)
        sources = []
        for sctx in sorted(ctxs, key=lambda x: prio[scope_of(x)], reverse=True):
            sname = asset.name if sctx.asset_id else \
                    (getattr(sctx.asset_tag, "name", None) if sctx.asset_tag_id else
                     getattr(sctx.asset_group, "name", None) if sctx.asset_group_id else
                     getattr(db.query(AssetType).get(asset.type_id), "name", "Type"))
            sources.append(SourceOut(
                scope=scope_of(sctx),
                name=sname,
                likelihood=int(sctx.likelihood or 0),
                impacts=pack_impacts(sctx)
            ))

        # required controls from template + MSB policies
        required_controls = get_required_controls(db, asset=asset, scenario_id=scn_id)
        required_ids = {c.id for c in required_controls}
        recommended_names = [control_display_name(c) for c in required_controls]

        # implemented controls on the PRIMARY context
        impl_status = ("implemented", "Verified")
        impl_links = db.query(ControlContextLink).filter(
            ControlContextLink.risk_scenario_context_id == primary.id,
            ControlContextLink.status.in_(impl_status)
        ).all() if 'ControlContextLink' in globals() else []

        impl_ids = {l.control_id for l in impl_links} & required_ids
        implemented_names = [control_display_name(c) for c in required_controls if c.id in impl_ids]

        controls = ControlsOut(
            implemented=len(impl_ids),
            total=len(required_ids),
            recommended=recommended_names,
            implementedList=implemented_names
        )

        compliance = build_compliance_chips(
            db,
            asset=asset,
            required_control_ids=required_ids,
            implemented_control_ids=impl_ids,
        )

        evidence = EvidenceOut(ok=0, warn=0)  # TODO: compute from control links evidence

        impacts = pack_impacts(primary)
        residual_val = residual if residual else 25  # your fallback
        appetite = resolve_appetite(db, asset=asset) or {
            "greenMax": 20, "amberMax": 30, "domainCaps": {}, "slaDays": {"amber": 30, "red": 7}
        }
        rag = compute_rag(
            residual=residual_val,
            appetite=appetite,
            likelihood=int(primary.likelihood or 0),
            impacts=impacts,
        )



        item = RiskEffectiveItem(
            id=primary.id,
            scenarioId=scn_id,
            scenarioTitle=scenario_title,
            assetName=asset.name,
            scope=scope_of(primary),
            owner="Unassigned",          # TODO: add owner to context if needed
            ownerInitials="?",
            status=primary.status or "Open",
            likelihood=int(primary.likelihood or 0),
            impacts=pack_impacts(primary),
            initial=initial if initial else 50,   # fallback demo value
            residual=residual if residual else 25, # fallback demo value
            trend=trend,
            controls=controls,
            evidence=evidence,
            lastReview=None,            # TODO: add fields to context if you want
            nextReview=None,            # TODO
            sources=sources,
            compliance=compliance,
            appetite=appetite,
            rag=rag
        )

        # appetite = resolve_appetite(db, asset=asset) or {
        #     "greenMax": 20, "amberMax": 30, "domainCaps": {}, "slaDays": {"amber": 30, "red": 7}
        # }
        # rag = compute_rag(
        #     residual=item.residual,  # your computed residual/int fallback
        #     appetite=appetite,
        #     likelihood=int(primary.likelihood or 0),
        #     impacts=pack_impacts(primary)  # you already have this helper
        # )

        # item["appetite"] = appetite
        # item["rag"] = rag

        results.append(item)

    if view == "all":
        # If you really need raw rows later, return each context expanded; for now stick to 'effective'
        pass

    return results
