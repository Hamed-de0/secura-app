# risk_context_list.py  (updated to unified scope)
from fastapi import HTTPException
from datetime import datetime, timedelta
from sqlalchemy import func, desc, asc, case, and_, or_

from app.models.risks.risk_scenario_context import RiskScenarioContext
from app.models.risks.risk_scenario import RiskScenario
from app.models.risks.risk_score import RiskScore

from app.models.controls.control_context_link import ControlContextLink
from app.models.controls.control_effect_rating import ControlEffectRating
from app.models.controls.control import Control
from app.schemas.risks.risk_context_details import *

from app.services.policy.resolver import *
from app.services.evidence.freshness import evidence_aggregate_by_context, evidence_aggregate_for_context
from app.crud.m4.context_details_summaries import (
    controls_summary_for_context,
    evidence_summary_for_context,
)
from app.models.controls.control_context_link import ControlContextLink as CCL
from app.models.compliance.control_evidence import ControlEvidence
from collections import defaultdict
from datetime import date


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
try:
    from app.models.risks.risk_score import RiskScore, RiskScoreHistory
except Exception:
    RiskScore, RiskScoreHistory = None, None

# Appetite (scope-based)
from app.models.policies.risk_appetite_policy import RiskAppetitePolicy

# ---------------- helpers ----------------

SPEC_SCOPE = ("asset","asset_group","asset_type","tag","bu","site","entity","service","org_group")

def _as_datetime(ts):
    """Coerce date/datetime/None to datetime (midnight for dates)."""
    if isinstance(ts, datetime):
        return ts
    if isinstance(ts, date):
        return datetime.combine(ts, datetime.min.time())
    return None

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

# Unified-scope label resolver (reuse your central version if you have one)
def resolve_scope_label(db: Session, scope_type: Optional[str], scope_id: Optional[int]) -> str:
    model_map = {
        "asset": ("app.models.assets.asset", "Asset", "name"),
        "asset_group": ("app.models.assets.asset_group", "AssetGroup", "name"),
        "asset_type": ("app.models.assets.asset_type", "AssetType", "name"),
        "tag": ("app.models.assets.asset_tag", "AssetTag", "name"),
        "entity": ("app.models.org.entity", "OrgEntity", "name"),
        "bu": ("app.models.org.business_unit", "BusinessUnit", "name"),
        "site": ("app.models.org.site", "Site", "name"),
        "service": ("app.models.services.service", "Service", "name"),
        "org_group": ("app.models.org.org_group", "OrgGroup", "name"),
    }
    if not scope_type:
        return "Organization"
    mod_path, cls_name, label_attr = model_map.get(scope_type, (None, None, None))
    if not mod_path or scope_id is None:
        return f"{scope_type}:{scope_id}" if scope_id is not None else scope_type
    try:
        module = __import__(mod_path, fromlist=[cls_name])
        cls = getattr(module, cls_name)
        row = db.query(cls).get(scope_id)
        return getattr(row, label_attr, f"{scope_type}:{scope_id}") if row else f"{scope_type}:{scope_id}"
    except Exception:
        return f"{scope_type}:{scope_id}"

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
        return {"greenMax": 9, "amberMax": 18, "domainCaps": {}, "slaDays": {"amber": 30, "red": 7}}

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

def _owner_display(u) -> tuple[str, str]:
    if not u:
        return "Unassigned", "?"
    # decide what you store on User
    first = getattr(u, "first_name", None)
    last = getattr(u, "last_name", None)
    if first or last:
        name = f"{first or ''} {last or ''}".strip()
        initials = "".join([p[0] for p in name.split() if p])[:2].upper() or "?"
        return name, initials
    # fallback to email/username
    email = getattr(u, "email", None) or getattr(u, "username", None) or "User"
    initials = (email[:1] + email.split("@")[0][1:2]).upper() if email else "?"
    return email, initials


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
    cutoff_30d = now - timedelta(days=30)

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
            "avgResidual": 0.0,
            "exceptionsExpiring30d": 0,
            "ownerAssigned": 0,
            "mitigationsInProgress": 0,
            "residualReduction30d": 0,
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

    # ---- Evidence aggregates (centralized) ----
    agg_by_ctx = evidence_aggregate_by_context(db, ctx_ids, stale_before)
    total_impl = sum(v["implemented"] for v in agg_by_ctx.values())
    total_overdue = sum(v["overdue"] for v in agg_by_ctx.values())
    total_ok = max(total_impl - total_overdue, 0)
    max_evidence_ts = max([v["max_evidence"] for v in agg_by_ctx.values() if v["max_evidence"]], default=None)

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

    # NEW accumulators
    residuals_for_avg: List[int] = []
    owner_assigned = 0
    filtered_ids: set[int] = set()

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
        residuals_for_avg.append(residual)

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

        # NEW: owner assigned count
        if getattr(c, "owner_id", None):
            owner_assigned += 1

        filtered_contexts.append(c)
        filtered_ids.add(c.id)

    filtered_ctx_ids = list(filtered_ids)

    # ---- Mitigations in progress ----
    # via status OR control links in approved/implemented (not verified)
    PROGRESS_STATUSES = {"mitigating", "inprogress", "in_progress"}
    mitig_contexts_status = {
        c.id for c in filtered_contexts
        if str(c.status or "").replace(" ", "").lower() in PROGRESS_STATUSES
    }
    link_progress_rows = (
        db.query(ControlContextLink.risk_scenario_context_id)
          .filter(ControlContextLink.risk_scenario_context_id.in_(filtered_ctx_ids))
          .filter(func.lower(ControlContextLink.assurance_status).in_(("approved", "implemented")))
          .distinct()
          .all()
    )
    mitig_contexts_links = {cid for (cid,) in link_progress_rows}
    mitigations_in_progress = len(mitig_contexts_status | mitig_contexts_links)

    # ---- Residual reduction over last 30 days ----
    if filtered_ctx_ids:
        sub = (
            db.query(
                RiskScoreHistory.risk_scenario_context_id.label("ctx"),
                func.max(RiskScoreHistory.created_at).label("mx")
            )
            .filter(RiskScoreHistory.risk_scenario_context_id.in_(filtered_ctx_ids),
                    RiskScoreHistory.created_at <= cutoff_30d)
            .group_by(RiskScoreHistory.risk_scenario_context_id)
            .subquery()
        )
        base_rows = (
            db.query(RiskScoreHistory.risk_scenario_context_id, RiskScoreHistory.residual_score)
              .join(sub, and_(
                    RiskScoreHistory.risk_scenario_context_id == sub.c.ctx,
                    RiskScoreHistory.created_at == sub.c.mx
              ))
              .all()
        )
        base_by_ctx = {cid: int(res or 0) for cid, res in base_rows}
    else:
        base_by_ctx = {}

    residual_reduction_30d = 0
    for cid in filtered_ctx_ids:
        latest = int(score_by_ctx.get(cid, {}).get("residual", 0) or 0)
        base = base_by_ctx.get(cid)
        if base is not None and base > latest:
            residual_reduction_30d += (base - latest)

    # ---- Exceptions expiring in 30 days (optional model) ----
    exceptions_expiring_30d = 0
    try:
        from app.models.compliance.exception import ComplianceException  # adjust if your model is named differently
    except Exception:
        ComplianceException = None

    if ComplianceException:
        exceptions_expiring_30d = int((
            db.query(func.count(func.distinct(ComplianceException.id)))
              .filter(ComplianceException.risk_scenario_context_id.in_(filtered_ctx_ids))
              .filter(ComplianceException.end_date.isnot(None))
              .filter(ComplianceException.end_date <= now + timedelta(days=30))
              .filter(or_(
                  getattr(ComplianceException, "active", None) == True,
                  getattr(ComplianceException, "status", None).in_(["approved", "active"])
              ))
              .scalar()
        ) or 0)

    # ---- Averages & timestamps ----
    avg_residual = round(sum(residuals_for_avg) / len(residuals_for_avg), 2) if residuals_for_avg else 0.0

    last_updated_max = None
    if last_updated_candidates or max_evidence_ts:
        last_updated_max = max([d for d in last_updated_candidates if d] + ([max_evidence_ts] if max_evidence_ts else []))

    return {
        "total": len(filtered_contexts),
        "overAppetite": over_appetite_count,
        "severityCounts": severity_counts,
        "ragCounts": rag_counts,
        "evidence": {"ok": total_ok, "warn": total_overdue, "overdue": total_overdue},
        "reviewSLA": {"onTrack": 0, "dueSoon": 0, "overdue": 0},   # fill if you persist next_review per-context
        "heatmap": heatmap,
        "avgResidual": avg_residual,                 # NEW
        "exceptionsExpiring30d": exceptions_expiring_30d,  # NEW
        "ownerAssigned": owner_assigned,             # NEW
        "mitigationsInProgress": mitigations_in_progress,  # NEW
        "residualReduction30d": residual_reduction_30d,    # NEW
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

    impl_by_ctx = evidence_aggregate_by_context(db, ctx_ids, stale_before)

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
        # score = c.score
        # initial = int(getattr(score, "inherent_score", 0) or 0) or 50
        # residual = int(getattr(score, "residual_score", 0) or 0) or 25
        #
        # impacts = _pack_impacts(c)
        # impact_overall = _impact_overall(impacts)
        score = c.score  # may be None
        likelihood = int(c.likelihood or 0)
        impacts = _pack_impacts(c)
        impact_overall = _impact_overall(impacts)

        if score:
            initial = int(getattr(score, "initial_score", 0) or 0)
            residual = int(getattr(score, "residual_score", 0) or 0)
        else:
            initial = impact_overall * likelihood
            residual = initial
        sev = _severity(impact_overall, int(c.likelihood or 0))
        sev_band = _severity_band(sev)

        # controls/evidence
        ev = impl_by_ctx.get(c.id, {"implemented": 0, "overdue": 0, "max_evidence": None})
        overdue = ev["overdue"]
        latest_ev = ev["max_evidence"]

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

        score_updated = getattr(score, "last_updated", None)  # not 'updated_at'
        updated_at_dt = _max_dt(getattr(c, "updated_at", None), latest_ev, score_updated)

        # Owner -------------
        owner_name, owner_initials = _owner_display(getattr(c, "owner", None))


        items.append({
            "contextId": c.id,
            "scenarioId": c.risk_scenario_id,
            "scenarioTitle": getattr(c.risk_scenario, "title_en", None) or getattr(c.risk_scenario, "title", None) or f"Scenario #{c.risk_scenario_id}",
            "scope": st,
            "scopeName": scope_label,
            "assetId": asset_id_for_app,         # only set for scope_type='asset'
            "assetName": scope_label if st == "asset" else None,
            "ownerId": getattr(c, "owner_id", None),
            "owner": owner_name,
            "ownerInitials": owner_initials,
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
            "updatedAt": updated_at_dt.isoformat() if updated_at_dt else None,
            "_u": updated_at_dt,  # temp only for sorting
            "overAppetite": over_app,
            "severity": sev,
            "severityBand": sev_band,
            "domains": domains,
            "scopeDisplay": f"{st}:{scope_label}" if scope_label else st,
            "scopeRef": {"type": st, "id": sid, "label": scope_label},
            "lastReview": getattr(c, "last_review", None) if not isinstance(getattr(c, "last_review", None), datetime) else getattr(c, "last_review").isoformat(),
            "nextReview": getattr(c, "next_review", None) if not isinstance(getattr(c, "next_review", None), datetime) else getattr(c, "next_review").isoformat(),
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
        items.sort(key=lambda it: (it.get("severity") or 0,
                                   it.get("residual") or 0,
                                   it.get("_u") or datetime.min),
                   reverse=reverse)
    elif sort_by == "residual":
        items.sort(key=lambda it: (it.get("residual") or 0,
                                   it.get("_u") or datetime.min),
                   reverse=reverse)
    elif sort_by in ("updated_at", "updatedAt"):
        items.sort(key=lambda it: (it.get("_u") or datetime.min),
                   reverse=reverse)
    else:
        items.sort(key=lambda it: (it.get("_u") or datetime.min, it["contextId"]),
                   reverse=reverse)

    # paginate AFTER sorting
    page = items[offset: offset + limit]

    # drop temp sort key so it never leaks to clients
    for it in page:
        it.pop("_u", None)

    return {"total": len(items), "items": page}


def get_context_by_details(db: Session, context_id: int, days: int = 90):
    now = datetime.utcnow()
    stale_before = now - timedelta(days=days)

    # --- 1) Load context + scenario + score ---
    ctx: RiskScenarioContext = (
        db.query(RiskScenarioContext)
        .join(RiskScenario)
        .outerjoin(RiskScore, RiskScore.risk_scenario_context_id == RiskScenarioContext.id)
        .filter(RiskScenarioContext.id == context_id)
        .first()
    )
    if not ctx:
        raise HTTPException(404, "Risk scenario context not found")

    scn: RiskScenario = ctx.risk_scenario
    score: RiskScore = ctx.score

    scenario_title = (
            getattr(scn, "title", None)
            or getattr(scn, "title_en", None)
            or getattr(scn, "title_de", None)
            or f"Scenario #{scn.id}"
    )
    scenario_desc = getattr(scn, "description", None) or getattr(scn, "description_en", None) or getattr(scn,
                                                                                                         "description_de",
                                                                                                         None)

    # --- 2) Scores & trend (fast path via RiskScore/RiskScoreHistory) ---
    initial = int(getattr(score, "inherent_score", 0) or 0) or 25
    residual = int(getattr(score, "residual_score", 0) or 0) or 25
    hist = (
        db.query(RiskScoreHistory)
        .filter(RiskScoreHistory.risk_scenario_context_id == ctx.id)
        .order_by(RiskScoreHistory.created_at.desc())
        .limit(days)
        .all()
    )
    trend = [{"x": i, "y": int(h.residual_score or 0)} for i, h in enumerate(reversed(hist))] if hist else []

    # --- 3) Impacts/likelihood/severity ---
    impacts = _pack_impacts(ctx)
    domains = [k for k in ("C", "I", "A", "L", "R") if impacts.get(k, 0)]
    impact_overall = _impact_overall(impacts)
    likelihood = int(ctx.likelihood or 0)
    severity = _severity(impact_overall, likelihood)
    severity_band = _severity_band(severity)

    # --- 4) Scope & appetite & rag ---
    scope_type = getattr(ctx, "scope_type", None)
    scope_id = getattr(ctx, "scope_id", None)
    scope_label = resolve_scope_label(db, scope_type, scope_id)
    appetite = resolve_appetite_for_scope(db, scope_type, scope_id)
    over_appetite = residual > int(appetite.get("amberMax") or 0)
    rag = compute_rag(
        residual=residual,
        appetite=appetite,
        likelihood=likelihood,
        impacts=impacts,
    )

    # --- 5) Controls: recommended (per scenario) + implemented links on this context ---
    rec_rows = (
        db.query(
            ControlEffectRating.control_id,
            Control.reference_code,
            Control.title_en,
            Control.title_de,
        )
        .join(Control, Control.id == ControlEffectRating.control_id)
        .filter(ControlEffectRating.risk_scenario_id == scn.id,
                ControlEffectRating.score > 0)
        .all()
    )
    rec_ids = {cid for (cid, _c, _e, _d) in rec_rows}
    # print('--------------------------------------------- rec', rec_ids)
    rec_names = [_control_display_name(c, e, d) for (_id, c, e, d) in rec_rows]
    rec_names = set(rec_names)  # remove duplicate by join

    # last evidence date per link (MAX(collected_at))
    ev_sub = (
        db.query(
            ControlEvidence.control_context_link_id.label("ccl_id"),
            func.max(ControlEvidence.collected_at).label("last_ev"),
        )
        .group_by(ControlEvidence.control_context_link_id)
        .subquery()
    )

    impl_rows = (
        db.query(
            CCL.id.label("link_id"),
            CCL.control_id.label("control_id"),
            CCL.assurance_status.label("assurance_status"),
            CCL.status_updated_at.label("status_updated_at"),
            ev_sub.c.last_ev.label("last_evidence"),
            # CCL.effectiveness_override.label("effectiveness_override"),
            Control.reference_code.label("code"),
            Control.title_en.label("title_en"),
            Control.title_de.label("title_de"),
        )
        .join(Control, Control.id == CCL.control_id)
        .outerjoin(ev_sub, ev_sub.c.ccl_id == CCL.id)
        .filter(CCL.risk_scenario_context_id == context_id)
        .all()
    )

    controls_out = []
    for r in impl_rows:
        controls_out.append({
            "id": r.link_id,
            "contextId": context_id,
            "controlId": r.control_id,
            "code": r.code,
            "title": r.title_en or r.title_de,
            "status": (r.assurance_status or "proposed"),
            "lastEvidenceAt": r.last_evidence,  # may be None
            # "effect": r.effectiveness_override or None,  # if you surface it in details
        })

    # Evidence aggregates (context-level, already used elsewhere)
    ev = evidence_aggregate_for_context(db, ctx.id, stale_before)
    evidence_overdue = int(ev["overdue"] or 0)
    evidence_ok = max(int(ev["implemented"] or 0) - evidence_overdue, 0)
    latest_ev_ts_dt = _as_datetime(ev.get("max_evidence"))

    # Implemented names/count only for recommended controls
    implemented_statuses = {"implemented", "verified"}
    impl_in_rec_names: List[str] = []
    implemented_count = 0

    for r in impl_rows:
        st = str(r.assurance_status or "").lower()
        if st in implemented_statuses and r.control_id in rec_ids:
            implemented_count += 1
            impl_in_rec_names.append(_control_display_name(r.code, r.title_en, r.title_de))
        for ts in (r.status_updated_at, r.last_evidence):
            ts_dt = _as_datetime(ts)
            if ts_dt and (latest_ev_ts_dt is None or ts_dt > latest_ev_ts_dt):
                latest_ev_ts_dt = ts_dt

    controls_total = len(rec_ids)
    coverage = (implemented_count / controls_total) if controls_total else None

    # Build link details (ALL links)
    link_details: List[ControlLinkDetails] = []
    for r in impl_rows:
        link_details.append(ControlLinkDetails(
            linkId=r.link_id,
            controlId=r.control_id,
            name=_control_display_name(r.code, r.title_en, r.title_de),
            referenceCode=r.code,
            assuranceStatus=r.assurance_status,
            statusUpdatedAt=r.status_updated_at,
            # No effectiveness_override column in your model → set None
            effectivenessOverride=None,
            # No 'notes' column on link → set None
            notes=None,
        ))

    # Implemented IDs (for compliance calc)
    implemented_ids = {
        r.control_id for r in impl_rows
        if str(r.assurance_status or "").lower() in implemented_statuses
    }

    controls = ControlsOut(
        implemented=implemented_count,
        total=controls_total,
        recommended=rec_names,
        implementedList=impl_in_rec_names,
        coverage=coverage,
    )
    evidence = EvidenceOut(ok=evidence_ok, warn=evidence_overdue, overdue=evidence_overdue)

    # --- 6) Compliance chips (reuse your existing service) ---
    req_controls = get_required_controls(db, asset=None, scenario_id=scn.id)  # if your impl needs asset, adapt
    required_ids = {c.id for c in req_controls}
    implemented_ids = {
        r.control_id for r in impl_rows
        if str(r.assurance_status or "").lower() in implemented_statuses
    }

    compliance = build_compliance_chips(
        db,
        asset=None,  # pass the asset if your implementation requires it; else None
        required_control_ids=required_ids,
        implemented_control_ids=implemented_ids,
    )

    # --- 7) Exceptions (optional) ---
    exceptions: List[ExceptionOut] = []
    try:
        from app.models.compliance.exception import ComplianceException
        ex_rows = (
            db.query(ComplianceException)
            .filter(ComplianceException.risk_scenario_context_id == ctx.id)
            .order_by(ComplianceException.expires_at.is_(None), ComplianceException.end_date.asc())
            .all()
        )
        for ex in ex_rows:
            exceptions.append(ExceptionOut(
                id=ex.id,
                title=getattr(ex, "title", None),
                status=getattr(ex, "status", None),
                active=getattr(ex, "active", None),
                expiresAt=getattr(ex, "expires_at", None),
            ))
    except Exception:
        pass

    # --- 8) Review fields & status ---
    last_review = getattr(ctx, "last_review", None)
    next_review = getattr(ctx, "next_review", None)
    review_status = None
    sla_amber = (appetite.get("slaDays") or {}).get("amber")
    if next_review:
        if now > next_review:
            review_status = "Overdue"
        elif sla_amber and (next_review - now).days <= int(sla_amber):
            review_status = "DueSoon"
        else:
            review_status = "OnTrack"

    # --- 9) Final updated timestamp ---
    last_updated_ts = max(
        [d for d in [
            getattr(ctx, "updated_at", None),  # context change
            getattr(score, "last_updated", None),  # RiskScore last change
            latest_ev_ts_dt  # newest evidence timestamp (centralized)
        ] if d] or [None]
    )

    owner_name, owner_initials = _owner_display(getattr(ctx, "owner", None))

    # Add M4 summaries (no extra queries than needed)
    controls_summary = controls_summary_for_context(db, context_id)
    evidence_summary = evidence_summary_for_context(db, context_id)

    # --- 10) Response ---
    return RiskContextDetails(
        contextId=ctx.id,
        scenarioId=scn.id,
        scenarioTitle=scenario_title,
        scenarioDescription=scenario_desc,

        scope=scope_type or "org",
        scopeRef=ScopeRef(type=scope_type, id=scope_id, label=scope_label),
        scopeDisplay=f"{scope_type}:{scope_label}" if scope_type else scope_label,

        ownerId=getattr(ctx, "owner_id", None),
        owner=owner_name,
        ownerInitials=owner_initials,

        status=ctx.status or "Open",
        likelihood=likelihood,
        impacts=impacts,
        domains=domains,

        initial=initial,
        residual=residual,
        severity=severity,
        severityBand=severity_band,
        overAppetite=over_appetite,
        rag=rag,

        trend=trend,
        lastUpdated=last_updated_ts,

        controls=controls,
        controlLinks=link_details,
        evidence=evidence,
        compliance=compliance,
        appetite=appetite,  # Pydantic will coerce dict→AppetiteOut

        lastReview=last_review,
        nextReview=next_review,
        reviewSLAStatus=review_status,

        exceptions=exceptions,

        asOf=now.replace(microsecond=0),

        controlsSummary= controls_summary,
        evidenceSummary= evidence_summary
    )
