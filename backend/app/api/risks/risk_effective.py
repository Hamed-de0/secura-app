from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Dict
from app.database import get_db
from app.schemas.risks.risk_effective import *
from app.models.assets.asset import Asset
from app.models.assets.asset_type import AssetType
from app.models.risks.risk_scenario_context import RiskScenarioContext
from app.models.risks.risk_scenario import RiskScenario
from app.models.risks.risk_score import RiskScore, RiskScoreHistory
from app.models.controls.control_context_link import ControlContextLink
from app.services.policy.resolver import resolve_appetite, compute_rag, get_required_controls, build_compliance_chips
from datetime import datetime, timedelta

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

def _severity(impacts: Dict[str, int], likelihood: int) -> int:
    """severity = (R or max(C,I,A)) * likelihood"""
    if not impacts:
        return 0
    base = impacts.get("R")
    if base is None:
        base = max(impacts.get(k, 0) for k in ("C", "I", "A"))
    try:
        return int(base) * int(likelihood or 0)
    except Exception:
        return 0

def _severity_band(sev: int) -> str:
    # Low ≤5, Medium 6–11, High 12–19, Critical ≥20
    if sev <= 5: return "Low"
    if sev <= 11: return "Medium"
    if sev <= 19: return "High"
    return "Critical"

def _max_dt(*vals):
    xs = [v for v in vals if v is not None]
    return max(xs) if xs else None

def _scope_ref_and_display(db: Session, asset: Asset, primary: RiskScenarioContext) -> tuple[ScopeRef, str | None]:
    st = scope_of(primary)  # 'asset' | 'tag' | 'group' | 'type'
    sid = None
    label = None
    if st == "asset":
        sid = primary.asset_id
        label = asset.name
    elif st == "tag":
        sid = getattr(primary, "asset_tag_id", None)
        atag = getattr(primary, "asset_tag", None)
        label = getattr(atag, "name", None) or "Tag"
    elif st == "group":
        sid = getattr(primary, "asset_group_id", None)
        ag = getattr(primary, "asset_group", None)
        label = getattr(ag, "name", None) or "Group"
    elif st == "type":
        sid = asset.type_id
        at = db.query(AssetType).get(asset.type_id) if asset.type_id else None
        label = getattr(at, "name", None) or "Type"
    scope_display = f"{st}:{label}" if st and label else (st if st else None)
    return ScopeRef(type=st, id=sid, label=label), scope_display

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
        # getattr(scenario, "title", None) or getattr(scenario, "title_en", None) or getattr(scenario, "title_de", None) or f"Scenario #{scenario.id}")
        scenario_title = scenario.title_en      # TODO choose language by context_users

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
            last_score_ts = max(h.created_at for h in hist)
        else:
            trend = [{"x": i, "y": 40 + ((i * 3) % 12)} for i in range(16)]
            last_score_ts = None

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
        recommended_names = [c.title_en for c in required_controls]

        # implemented controls on the PRIMARY context
        impl_status = ("implemented", "Verified")
        impl_links = db.query(ControlContextLink).filter(
            ControlContextLink.risk_scenario_context_id == primary.id,
            ControlContextLink.assurance_status.in_(impl_status)
        ).all() if 'ControlContextLink' in globals() else []

        impl_ids = {l.control_id for l in impl_links} & required_ids
        implemented_names = [c.title_en for c in required_controls if c.id in impl_ids]

        now = datetime.utcnow()
        stale_before = now - timedelta(days=days)
        overdue_count = sum(
            1 for l in impl_links
            if (getattr(l, "evidence_updated_at", None) is None) or (l.evidence_updated_at < stale_before)
        )
        ok_count = max(len(impl_links) - overdue_count, 0)
        latest_evidence_ts = _max_dt(*[getattr(l, "evidence_updated_at", None) for l in impl_links])

        controls = ControlsOut(
            implemented=len(impl_ids),
            total=len(required_ids),
            recommended=recommended_names,
            implementedList=implemented_names,
            coverage=(len(impl_ids) / len(required_ids)) if required_ids else None,  # 0..1
        )

        compliance = build_compliance_chips(
            db,
            asset=asset,
            required_control_ids=required_ids,
            implemented_control_ids=impl_ids,
        )

        evidence = EvidenceOut(
            ok=ok_count,
            warn=overdue_count,
            overdue=overdue_count,  # explicit field requested
        )  # TODO: compute from control links evidence

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

        sev = _severity(impacts, int(primary.likelihood or 0))
        sev_band = _severity_band(sev)
        over_appetite = bool(
            appetite and isinstance(appetite, dict) and residual_val > int(appetite.get("amberMax", 0))
            or getattr(appetite, "amberMax", None) is not None and residual_val > int(getattr(appetite, "amberMax"))
        )
        scope_ref, scope_display = _scope_ref_and_display(db, asset, primary)
        domains = [k for k in ("C", "I", "A", "L", "R") if k in impacts]

        # updatedAt = max of context update / score history / evidence freshness
        updated_at = _max_dt(
            getattr(primary, "updated_at", None),
            getattr(score, "updated_at", None),
            last_score_ts,
            latest_evidence_ts,
        )

        # optional reviewSLAStatus from nextReview + appetite.slaDays.amber
        next_review = None
        sla_amber = None
        if isinstance(appetite, dict):
            sla = appetite.get("slaDays") or {}
            sla_amber = sla.get("amber")
        else:
            sla = getattr(appetite, "slaDays", None)
            sla_amber = getattr(sla, "amber", None) if sla else None

        if next_review:
            if now > next_review:
                review_sla = "Overdue"
            elif sla_amber and (next_review - now).days <= int(sla_amber):
                review_sla = "DueSoon"
            else:
                review_sla = "OnTrack"
        else:
            review_sla = None

        item = RiskEffectiveItem(
            id=primary.id,
            scenarioId=scn_id,
            scenarioTitle=scenario_title,
            assetName=asset.name,
            scope=scope_of(primary),
            owner="Unassigned",  # TODO: add owner to context if needed
            ownerInitials="?",
            status=primary.status or "Open",
            likelihood=int(primary.likelihood or 0),
            impacts=impacts,
            initial=initial if initial else 50,
            residual=residual if residual else 25,
            trend=trend,
            controls=controls,
            evidence=evidence,
            lastReview=None,  # TODO: wire if available
            nextReview=next_review.isoformat() if isinstance(next_review, datetime) else None,
            last_update=getattr(primary, "updated_at", None),

            # NEW fields
            updatedAt=updated_at,
            overAppetite=over_appetite,
            severity=sev,
            severityBand=sev_band,
            domains=domains,
            scopeDisplay=scope_display,
            scopeRef=scope_ref,
            reviewSLAStatus=review_sla,

            sources=sources,
            compliance=compliance,
            appetite=appetite,
            rag=rag
        )

        results.append(item)

    if view == "all":
        # If you really need raw rows later, return each context expanded; for now stick to 'effective'
        pass

    return results
