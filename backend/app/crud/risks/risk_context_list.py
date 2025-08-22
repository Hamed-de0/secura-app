# risk_context_list.py  (updated to unified scope)

from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, asc, case, and_, or_

from app.models.risks.risk_scenario_context import RiskScenarioContext
from app.models.risks.risk_scenario import RiskScenario
from app.models.risks.risk_score import RiskScore

from app.models.controls.control_context_link import ControlContextLink
from app.models.controls.control_effect_rating import ControlEffectRating
from app.models.controls.control import Control

from app.services.policy.resolver import resolve_appetite, compute_rag
from collections import defaultdict

# Optional/known models for scope labels (import if present)
try:
    from app.models.assets.asset import Asset
except Exception:
    Asset = None
try:
    from app.models.assets.asset_group import AssetGroup
except Exception:
    AssetGroup = None
try:
    from app.models.assets.asset_type import AssetType
except Exception:
    AssetType = None
try:
    from app.models.assets.asset_tag import AssetTag
except Exception:
    AssetTag = None
try:
    from app.models.org.entity import OrgEntity
except Exception:
    OrgEntity = None
try:
    from app.models.org.business_unit import BusinessUnit
except Exception:
    BusinessUnit = None
try:
    from app.models.org.site import Site
except Exception:
    Site = None
try:
    from app.models.org.service import Service
except Exception:
    Service = None
try:
    from app.models.org.group import OrgGroup
except Exception:
    OrgGroup = None

# Appetite (scope-based)
from app.models.policies.risk_appetite_policy import RiskAppetitePolicy

# ---------------- helpers ----------------

SPEC_SCOPE = ("asset","asset_group","asset_type","tag","bu","site","entity","service","org_group")

def _pack_impacts(c: RiskScenarioContext) -> Dict[str, int]:
    """
    Build impacts dict from your context model.
    Adjust if you store ratings differently.
    """
    # Example if you keep a list of per-domain scores (C,I,A,L,R):
    vals = [r.score for r in (getattr(c, "impact_ratings", []) or [])[:5]]
    vals += [0] * (5 - len(vals))
    return {"C": vals[0], "I": vals[1], "A": vals[2], "L": vals[3], "R": vals[4]}

def _impact_overall(imp: Dict[str, int]) -> int:
    return imp.get("R") or max(imp.get("C", 0), imp.get("I", 0), imp.get("A", 0), imp.get("L", 0))

def _severity(imp_overall: int, likelihood: int) -> int:
    try:
        return int(imp_overall) * int(likelihood or 0)
    except Exception:
        return 0

def _severity_band(sev: int) -> str:
    if sev <= 5: return "Low"
    if sev <= 11: return "Medium"
    if sev <= 19: return "High"
    return "Critical"

def _max_dt(*vals: Optional[datetime]) -> Optional[datetime]:
    xs = [v for v in vals if v is not None]
    return max(xs) if xs else None

def resolve_scope_info(db: Session, scope_type: Optional[str], scope_id: Optional[int]) -> Tuple[Optional[str], Optional[int]]:
    """
    Returns (label, asset_id_for_appetite) for a given (scope_type, scope_id).
    asset_id_for_appetite is only meaningful when scope_type == 'asset'.
    """
    if not scope_type:
        return ("Organization", None)

    # ORM lookups only if the model exists
    if scope_type == "asset" and Asset and scope_id:
        row = db.query(Asset).get(scope_id)
        return (getattr(row, "name", f"asset:{scope_id}") if row else f"asset:{scope_id}", scope_id)

    if scope_type == "asset_group" and AssetGroup and scope_id:
        row = db.query(AssetGroup).get(scope_id)
        return (getattr(row, "name", f"group:{scope_id}") if row else f"group:{scope_id}", None)

    if scope_type == "asset_type" and AssetType and scope_id:
        row = db.query(AssetType).get(scope_id)
        return (getattr(row, "name", f"type:{scope_id}") if row else f"type:{scope_id}", None)

    if scope_type == "tag" and AssetTag and scope_id:
        row = db.query(AssetTag).get(scope_id)
        return (getattr(row, "name", f"tag:{scope_id}") if row else f"tag:{scope_id}", None)

    if scope_type == "entity" and OrgEntity and scope_id:
        row = db.query(OrgEntity).get(scope_id)
        return (getattr(row, "name", f"entity:{scope_id}") if row else f"entity:{scope_id}", None)

    if scope_type == "bu" and BusinessUnit and scope_id:
        row = db.query(BusinessUnit).get(scope_id)
        return (getattr(row, "name", f"bu:{scope_id}") if row else f"bu:{scope_id}", None)

    if scope_type == "site" and Site and scope_id:
        row = db.query(Site).get(scope_id)
        return (getattr(row, "name", f"site:{scope_id}") if row else f"site:{scope_id}", None)

    if scope_type == "service" and Service and scope_id:
        row = db.query(Service).get(scope_id)
        return (getattr(row, "name", f"service:{scope_id}") if row else f"service:{scope_id}", None)

    if scope_type == "org_group" and OrgGroup and scope_id:
        row = db.query(OrgGroup).get(scope_id)
        return (getattr(row, "name", f"org_group:{scope_id}") if row else f"org_group:{scope_id}", None)

    # default fallback
    return (f"{scope_type}:{scope_id}" if scope_id is not None else scope_type, None)

def resolve_appetite_for_scope(db: Session, scope_type: Optional[str], scope_id: Optional[int]) -> Dict[str, Any]:
    """
    Minimal scope-based appetite resolver against risk_appetite_policies:
    1) Try exact (scope, scope_id), active by date.
    2) Fallback to global (NULL,NULL).
    Returns dict {greenMax, amberMax, domainCaps, slaDays}.
    """
    now = datetime.utcnow()
    q = (
        db.query(RiskAppetitePolicy)
          .filter(RiskAppetitePolicy.effective_from <= now)
          .filter(or_(RiskAppetitePolicy.effective_to.is_(None), RiskAppetitePolicy.effective_to >= now))
    )
    if scope_type and scope_id is not None:
        q = q.filter(
            or_(
                and_(RiskAppetitePolicy.scope == scope_type, RiskAppetitePolicy.scope_id == scope_id),
                and_(RiskAppetitePolicy.scope.is_(None), RiskAppetitePolicy.scope_id.is_(None)),
            )
        ).order_by(
            # prefer exact scope before global, then priority
            desc(RiskAppetitePolicy.scope.is_(None)),
            desc(RiskAppetitePolicy.priority),
            desc(RiskAppetitePolicy.id),
        )
    else:
        q = q.filter(RiskAppetitePolicy.scope.is_(None), RiskAppetitePolicy.scope_id.is_(None))\
             .order_by(desc(RiskAppetitePolicy.priority), desc(RiskAppetitePolicy.id))

    row = q.first()
    if not row:
        return {"greenMax": 20, "amberMax": 30, "domainCaps": {}, "slaDays": {"amber": 30, "red": 7}}

    return {
        "greenMax": row.green_max,
        "amberMax": row.amber_max,
        "domainCaps": row.domain_caps_json or {},
        "slaDays": {"amber": row.sla_days_amber, "red": row.sla_days_red},
    }

def _control_display_name(code: Optional[str], title_en: Optional[str], title_de: Optional[str]) -> str:
    title = title_en or title_de or ""
    if code and title:
        return f"{code} – {title}"
    return title or (code or "Control")

# ------------- main query ----------------
def context_metrics(
        db: Session,
        scope: Optional[str] = "all",
        scope_id: Optional[int] = None,
        status: Optional[str] = "all",
        domain: Optional[str] = "all",
        over_appetite: Optional[bool] = None,
        owner_id: Optional[int] = None,
        days: Optional[int] = 365,
        search: Optional["str"] = None,

) -> Dict[str, Any]:
    now = datetime.utcnow()
    stale_before = now - timedelta(days=days)

    # ---- Base contexts with filters (unified scope) ----
    q = (db.query(RiskScenarioContext)
         .join(RiskScenario)
         .outerjoin(RiskScore, RiskScore.risk_scenario_context_id == RiskScenarioContext.id))

    if scope != "all":
        q = q.filter(RiskScenarioContext.scope_type == scope)
        if scope_id is not None:
            q = q.filter(RiskScenarioContext.scope_id == scope_id)
    if status != "all":
        q = q.filter(RiskScenarioContext.status == status)
    if owner_id is not None:
        q = q.filter(RiskScenarioContext.owner_id == owner_id)
    if search:
        like = f"%{search.lower()}%"
        q = q.filter(func.lower(func.coalesce(RiskScenario.title_en, "")).like(like))

    contexts: List[RiskScenarioContext] = q.all()
    if not contexts:
        return {
            "total": 0,
            "overAppetite": 0,
            "severityCounts": {"Low": 0, "Medium": 0, "High": 0, "Critical": 0},
            "ragCounts": {"Green": 0, "Amber": 0, "Red": 0},
            "evidence": {"ok": 0, "warn": 0, "overdue": 0},
            "reviewSLA": {"onTrack": 0, "dueSoon": 0, "overdue": 0},
            "heatmap": {},
            "lastUpdatedMax": None,
            "asOf": now.replace(microsecond=0).isoformat() + "Z",
        }

    ctx_ids = [c.id for c in contexts]
    scn_ids = list({c.risk_scenario_id for c in contexts})

    # ---- Bulk scores (fast path) ----
    scores = db.query(
        RiskScore.risk_scenario_context_id,
        RiskScore.residual_score,
        RiskScore.last_updated
    ).filter(RiskScore.risk_scenario_context_id.in_(ctx_ids)).all()
    score_by_ctx = {cid: {"residual": (res or 0), "last": lu} for cid, res, lu in scores}

    # ---- Evidence aggregates (implemented + overdue) ----
    ev_rows = (
        db.query(
            func.sum(
                case((func.lower(ControlContextLink.assurance_status).in_(("implemented", "verified")), 1), else_=0)
            ).label("impl"),
            func.sum(
                case((
                    and_(
                        func.lower(ControlContextLink.assurance_status).in_(("implemented", "verified")),
                        or_(ControlContextLink.status_updated_at.is_(None),
                            ControlContextLink.status_updated_at < stale_before)
                    ), 1), else_=0)
            ).label("overdue"),
            func.max(ControlContextLink.status_updated_at).label("max_ev")
        )
        .filter(ControlContextLink.risk_scenario_context_id.in_(ctx_ids))
        .one()
    )
    total_impl = int(ev_rows.impl or 0)
    total_overdue = int(ev_rows.overdue or 0)
    total_ok = max(total_impl - total_overdue, 0)
    max_evidence_ts = ev_rows.max_ev

    # ---- Recommended totals per scenario (for coverage in heatmap/KPI if needed)
    rec_rows = (
        db.query(
            ControlEffectRating.risk_scenario_id,
            func.count(ControlEffectRating.control_id).label("n")
        )
        .filter(ControlEffectRating.risk_scenario_id.in_(scn_ids),
                ControlEffectRating.score > 0)
        .group_by(ControlEffectRating.risk_scenario_id)
        .all()
    )
    rec_by_scn = {sid: int(n) for sid, n in rec_rows}

    # ---- Compute per-context derived fields (severity, bands, appetite, rag) ----
    severity_counts = {"Low": 0, "Medium": 0, "High": 0, "Critical": 0}
    rag_counts = {"Green": 0, "Amber": 0, "Red": 0}
    heatmap: Dict[str, int] = {}
    over_appetite_count = 0
    last_updated_candidates: List[datetime] = []

    # cache appetite per unique (scope_type, scope_id)
    uniq_scopes = {(c.scope_type, c.scope_id) for c in contexts}
    appetite_cache: Dict[tuple, Dict] = {pair: resolve_appetite_for_scope(db, *pair) for pair in uniq_scopes}

    filtered_contexts: List[RiskScenarioContext] = []

    for c in contexts:
        impacts = _pack_impacts(c)
        if domain in ("C", "I", "A", "L", "R") and (impacts.get(domain, 0) or 0) <= 0:
            continue

        impact_overall = _impact_overall(impacts)
        sev = _severity(impact_overall, int(c.likelihood or 0))
        band = _severity_band(sev)

        sc = score_by_ctx.get(c.id, {"residual": 0, "last": None})
        residual = int(sc["residual"] or 0)

        appetite = appetite_cache[(c.scope_type, c.scope_id)]
        amber_max = int(appetite.get("amberMax") or 0)
        is_over = residual > amber_max

        # optional filter
        if over_appetite is not None and bool(is_over) != bool(over_appetite):
            continue

        # RAG via your existing function
        rag = compute_rag(
            residual=residual,
            appetite=appetite,
            likelihood=int(c.likelihood or 0),
            impacts=impacts,
        )

        severity_counts[band] += 1
        rag_counts[rag] = rag_counts.get(rag, 0) + 1
        if is_over:
            over_appetite_count += 1

        # heatmap cell (impactOverall x likelihood)
        key = f"{impact_overall}x{int(c.likelihood or 0)}"
        heatmap[key] = heatmap.get(key, 0) + 1

        # updated timestamps to compute max
        last_updated_candidates.extend([getattr(c, "updated_at", None), sc["last"]])

        filtered_contexts.append(c)

    # Review SLA counts (if you store next_review on context)
    review_on, review_soon, review_over = 0, 0, 0
    for c in filtered_contexts:
        next_review = getattr(c, "next_review", None)
        if not next_review:
            continue
        appetite = appetite_cache[(c.scope_type, c.scope_id)]
        sla_amber = (appetite.get("slaDays") or {}).get("amber")
        if now > next_review:
            review_over += 1
        elif sla_amber and (next_review - now).days <= int(sla_amber):
            review_soon += 1
        else:
            review_on += 1

    last_updated_max = None
    if last_updated_candidates or max_evidence_ts:
        last_updated_max = max(
            [d for d in last_updated_candidates if d] + ([max_evidence_ts] if max_evidence_ts else []))

    return {
        "total": len(filtered_contexts),
        "overAppetite": over_appetite_count,
        "severityCounts": severity_counts,
        "ragCounts": rag_counts,
        "evidence": {"ok": total_ok, "warn": total_overdue, "overdue": total_overdue},
        "reviewSLA": {"onTrack": review_on, "dueSoon": review_soon, "overdue": review_over},
        "heatmap": heatmap,
        "lastUpdatedMax": last_updated_max.replace(microsecond=0).isoformat() + "Z" if last_updated_max else None,
        "asOf": now.replace(microsecond=0).isoformat() + "Z",
    }


def list_contexts(
    db: Session,
    *,
    offset: int = 0,
    limit: int = 25,
    sort_by: str = "updated_at",   # "severity" | "residual" | "updated_at"
    sort_dir: str = "desc",
    scope: str = "all",            # one of SPEC_SCOPE or 'all'
    status: str = "all",
    search: str = "",
    # NEW filters
    domain: str = "all",                 # C|I|A|L|R|all
    over_appetite: Optional[bool] = None,
    owner_id: Optional[int] = None,
    days: int = 90,
):
    q = (
        db.query(RiskScenarioContext)
          .join(RiskScenario)
          .outerjoin(RiskScore, RiskScore.risk_scenario_context_id == RiskScenarioContext.id)
    )

    # Filters (unified scope)
    if scope != "all":
        q = q.filter(RiskScenarioContext.scope_type == scope)

    if status != "all":
        q = q.filter(RiskScenarioContext.status == status)

    if owner_id is not None:
        q = q.filter(RiskScenarioContext.owner_id == owner_id)

    if search:
        like = f"%{search.lower()}%"
        # Adjust fields you want searchable:
        q = q.filter(func.lower(func.coalesce(RiskScenario.title_en, "")).like(like))

    base_rows: List[RiskScenarioContext] = q.all()
    if not base_rows:
        return {"total": 0, "items": []}

    # Aggregates (controls/evidence and recommended totals)
    ctx_ids = [c.id for c in base_rows]
    scn_ids = list({c.risk_scenario_id for c in base_rows})

    now = datetime.utcnow()
    stale_before = now - timedelta(days=days)

    impl_agg = (
        db.query(
            ControlContextLink.risk_scenario_context_id.label("ctx"),
            func.sum(
                case(
                    (func.lower(ControlContextLink.assurance_status).in_(("implemented","verified")), 1),
                    else_=0
                )
            ).label("implemented"),
            func.sum(
                case(
                    (
                        and_(
                            func.lower(ControlContextLink.assurance_status).in_(("implemented","verified")),
                            or_(
                                ControlContextLink.status_updated_at.is_(None),
                                ControlContextLink.status_updated_at < stale_before,
                            ),
                        ),
                        1,
                    ),
                    else_=0,
                )
            ).label("overdue"),
            func.max(ControlContextLink.status_updated_at).label("max_evidence"),
        )
        .filter(ControlContextLink.risk_scenario_context_id.in_(ctx_ids))
        .group_by(ControlContextLink.risk_scenario_context_id)
        .all()
    )


    # impl_by_ctx = {
    #     r.ctx: {"implemented": int(r.implemented or 0), "overdue": int(r.overdue or 0), "max_evidence": r.max_evidence}
    #     for r in impl_agg
    # }

    # rec_rows = (
    #     db.query(
    #         ControlEffectRating.risk_scenario_id,
    #         func.count(ControlEffectRating.control_id).label("n"),
    #     )
    #     .filter(
    #         ControlEffectRating.risk_scenario_id.in_(scn_ids),
    #         ControlEffectRating.score > 0,
    #     )
    #     .group_by(ControlEffectRating.risk_scenario_id)
    #     .all()
    # )

    # Implemented links per context (names resolved in bulk)
    impl_pairs = (
        db.query(
            ControlContextLink.risk_scenario_context_id,
            ControlContextLink.control_id,
        )
        .filter(
            ControlContextLink.risk_scenario_context_id.in_(ctx_ids),
            func.lower(ControlContextLink.assurance_status).in_(("implemented", "verified")),
        )
        .all()
    )

    impl_ids_by_ctx = defaultdict(set)
    all_impl_ctrl_ids = set()
    for ctx, cid in impl_pairs:
        impl_ids_by_ctx[ctx].add(cid)
        all_impl_ctrl_ids.add(cid)

    # Resolve control names once
    if all_impl_ctrl_ids:
        ctrl_rows = (
            db.query(Control.id, Control.reference_code, Control.title_en, Control.title_de)
            .filter(Control.id.in_(all_impl_ctrl_ids))
            .all()
        )
        ctrl_name_by_id = {
            rid: _control_display_name(code, t_en, t_de)
            for (rid, code, t_en, t_de) in ctrl_rows
        }
    else:
        ctrl_name_by_id = {}
    rec_rows = (
        db.query(
            ControlEffectRating.risk_scenario_id,
            Control.id,
            Control.reference_code,
            Control.title_en,
            Control.title_de,
        )
        .join(Control, Control.id == ControlEffectRating.control_id)
        .filter(
            ControlEffectRating.risk_scenario_id.in_(scn_ids),
            ControlEffectRating.score > 0,
        )
        .all()
    )

    rec_ids_by_scn = defaultdict(set)
    rec_names_by_scn = defaultdict(list)
    for sid, cid, code, t_en, t_de in rec_rows:
        if cid not in rec_ids_by_scn[sid]:
            rec_ids_by_scn[sid].add(cid)
            rec_names_by_scn[sid].append(_control_display_name(code, t_en, t_de))

    # rec_by_scn = {sid: int(n) for sid, n in rec_rows}

    items: List[Dict[str, Any]] = []
    for c in base_rows:
        st = getattr(c, "scope_type", None)
        sid = getattr(c, "scope_id", None)

        # scope labels + appetite at that scope
        scope_label, asset_id_for_app = resolve_scope_info(db, st, sid)
        appetite = resolve_appetite_for_scope(db, st, sid)

        # scores
        score = c.score
        initial = int(getattr(score, "inherent_score", 0) or 0) or 50
        residual = int(getattr(score, "residual_score", 0) or 0) or 25

        impacts = _pack_impacts(c)
        impact_overall = _impact_overall(impacts)
        sev = _severity(impact_overall, int(c.likelihood or 0))
        sev_band = _severity_band(sev)

        # controls/evidence
        # impl = impl_by_ctx.get(c.id, {}).get("implemented", 0)
        overdue = impl_ids_by_ctx.get(c.id, {}).get("overdue", 0)
        latest_ev = impl_ids_by_ctx.get(c.id, {}).get("max_evidence")
        # recommended_total = rec_by_scn.get(c.risk_scenario_id, 0)
        # coverage = (impl / recommended_total) if recommended_total else None

        rec_ids = rec_ids_by_scn.get(c.risk_scenario_id, set())
        rec_names = rec_names_by_scn.get(c.risk_scenario_id, [])

        impl_ids_ctx = impl_ids_by_ctx.get(c.id, set())
        # Only count an implementation if it's part of the recommended set
        impl_ids_in_rec = [cid for cid in impl_ids_ctx if cid in rec_ids]
        implemented_names = [ctrl_name_by_id.get(cid, f"Control {cid}") for cid in impl_ids_in_rec]

        recommended_total = len(rec_ids)
        implemented_count = len(impl_ids_in_rec)
        coverage = (implemented_count / recommended_total) if recommended_total else None

        # overAppetite
        amber_max = appetite.get("amberMax", 0)
        over_app = residual > int(amber_max or 0)

        # domains (non-zero only)
        domains = [k for k, v in impacts.items() if v and v > 0]

        # updatedAt (context vs evidence vs score updated)
        updated_at = _max_dt(getattr(c, "updated_at", None), latest_ev, getattr(score, "updated_at", None))

        # SLA status if you later add next_review on context
        next_review = getattr(c, "next_review", None)
        if next_review:
            if now > next_review:
                review_sla = "Overdue"
            elif appetite.get("slaDays", {}).get("amber") and (next_review - now).days <= int(appetite["slaDays"]["amber"]):
                review_sla = "DueSoon"
            else:
                review_sla = "OnTrack"
        else:
            review_sla = None

        items.append({
            "contextId": c.id,
            "scenarioId": c.risk_scenario_id,
            "scenarioTitle": getattr(c.risk_scenario, "title_en", None) or getattr(c.risk_scenario, "title", None) or f"Scenario #{c.risk_scenario_id}",
            "scope": st,
            "scopeName": scope_label,
            "assetId": asset_id_for_app,         # only set for scope_type='asset'
            "assetName": scope_label if st == "asset" else None,
            "ownerId": getattr(c, "owner_id", None),
            "owner": "Unassigned",
            "ownerInitials": "?",
            "status": c.status or "Open",
            "likelihood": int(c.likelihood or 0),
            "impacts": impacts,
            "impactOverall": impact_overall,     # NEW
            "initial": initial,
            "residual": residual,
            "trend": [{"x": i, "y": 40 + ((i * 3) % 12)} for i in range(12)],  # placeholder
            "controls": {
                "implemented": implemented_count,
                "total": recommended_total,
                "recommended": rec_names,     # optionally fill names
                "implementedList": implemented_names, # optionally fill names
                "coverage": coverage,  # NEW 0..1
            },
            "evidence": {
                "ok": max(implemented_count - overdue, 0),
                "warn": overdue,
                "overdue": overdue,    # NEW
            },
            "updatedAt": updated_at.isoformat() if updated_at else None,
            "overAppetite": over_app,
            "severity": sev,
            "severityBand": sev_band,
            "domains": domains,
            "scopeDisplay": f"{st}:{scope_label}" if scope_label else st,
            "scopeRef": {"type": st, "id": sid, "label": scope_label},
            "lastReview": getattr(c, "last_review", None),
            "nextReview": getattr(c, "next_review", None),
            "reviewSLAStatus": review_sla,
            # Optional: appetite snapshot for the row
            "appetite": appetite,
        })

    # ----- derived filters (domain / over_appetite) -----
    if domain in ("C","I","A","L","R"):
        items = [it for it in items if (it["impacts"].get(domain, 0) or 0) > 0]
    if over_appetite is not None:
        items = [it for it in items if bool(it.get("overAppetite")) == bool(over_appetite)]

    total = len(items)

    # ----- sorting -----
    reverse = (sort_dir.lower() == "desc")
    if sort_by == "severity":
        items.sort(key=lambda it: (it.get("severity") or 0, it.get("residual") or 0, it.get("updatedAt") or ""), reverse=reverse)
    elif sort_by == "residual":
        items.sort(key=lambda it: (it.get("residual") or 0, it.get("updatedAt") or ""), reverse=reverse)
    elif sort_by == "updated_at":
        items.sort(key=lambda it: (it.get("updatedAt") or ""), reverse=reverse)
    else:
        items.sort(key=lambda it: (it.get("updatedAt") or "", it["contextId"]), reverse=reverse)

    # ----- pagination -----
    items = items[offset: offset + limit]

    return {"total": total, "items": items}
