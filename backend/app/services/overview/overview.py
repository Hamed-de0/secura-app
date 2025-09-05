from __future__ import annotations
from typing import List, Tuple
from datetime import datetime, timedelta, timezone
from sqlalchemy import func, select, distinct, or_, and_
from sqlalchemy.orm import Session

from app.schemas.dashboards.overview import (
    OverviewSummary, KPIs, DonutControls, DonutSoA, DonutRisks, FrameworkRow
)

# exact models (from your repo)
from app.models.assets.asset import Asset
from app.models.assets.asset_tag import AssetTag, asset_tags_links
from app.models.risks.risk_scenario_context import RiskScenarioContext
from app.models.risks.risk_score import RiskScore
from app.models.policies.risk_appetite_policy import RiskAppetitePolicy

from app.models.controls.control_context_link import ControlContextLink
from app.models.compliance.control_evidence import ControlEvidence

from app.models.compliance.framework_version import FrameworkVersion
from app.services.compliance.coverage_summary import compute_coverage_summary


def _now_utc() -> datetime:
    try:
        return datetime.now(timezone.utc)
    except Exception:
        return datetime.utcnow()


# -------------------- Controls / SoA donuts --------------------

def _controls_status_counts(db: Session, scope_type: str, scope_id: int) -> DonutControls:
    total = db.execute(
        select(func.count(ControlContextLink.id)).where(
            ControlContextLink.scope_type == scope_type,
            ControlContextLink.scope_id == scope_id
        )
    ).scalar_one() or 0

    na = db.execute(
        select(func.count(ControlContextLink.id)).where(
            ControlContextLink.scope_type == scope_type,
            ControlContextLink.scope_id == scope_id,
            ControlContextLink.applicability == "na"
        )
    ).scalar_one() or 0

    applicable_total = db.execute(
        select(func.count(ControlContextLink.id)).where(
            ControlContextLink.scope_type == scope_type,
            ControlContextLink.scope_id == scope_id,
            or_(ControlContextLink.applicability.is_(None), ControlContextLink.applicability != "na")
        )
    ).scalar_one() or 0

    # "pass" = applicable CCL with at least one valid-now evidence
    passed = db.execute(
        select(func.count(distinct(ControlContextLink.id)))
        .select_from(ControlContextLink)
        .join(ControlEvidence, ControlEvidence.control_context_link_id == ControlContextLink.id)
        .where(
            ControlContextLink.scope_type == scope_type,
            ControlContextLink.scope_id == scope_id,
            or_(ControlContextLink.applicability.is_(None), ControlContextLink.applicability != "na"),
            ControlEvidence.status == "valid",
            or_(ControlEvidence.valid_until.is_(None), ControlEvidence.valid_until >= func.now()),
        )
    ).scalar_one() or 0

    fail = max(applicable_total - passed, 0)

    return DonutControls(
        controls_pass=int(passed),
        controls_fail=int(fail),
        controls_na=int(na),
        controls_total=int(total),
    )


def _soa_applicability_counts(db: Session, scope_type: str, scope_id: int) -> DonutSoA:
    total = db.execute(
        select(func.count(ControlContextLink.id)).where(
            ControlContextLink.scope_type == scope_type,
            ControlContextLink.scope_id == scope_id
        )
    ).scalar_one() or 0

    applicable = db.execute(
        select(func.count(ControlContextLink.id)).where(
            ControlContextLink.scope_type == scope_type,
            ControlContextLink.scope_id == scope_id,
            or_(ControlContextLink.applicability.is_(None), ControlContextLink.applicability == "applicable")
        )
    ).scalar_one() or 0

    na = db.execute(
        select(func.count(ControlContextLink.id)).where(
            ControlContextLink.scope_type == scope_type,
            ControlContextLink.scope_id == scope_id,
            ControlContextLink.applicability == "na"
        )
    ).scalar_one() or 0

    unknown = max(total - applicable - na, 0)
    return DonutSoA(
        applicable_count=int(applicable),
        na_count=int(na),
        unknown_count=int(unknown),
        total_controls=int(total),
    )


# -------------------- KPIs: evidence / risks / assets --------------------

def _evidence_due_counts(db: Session, scope_type: str, scope_id: int, within_days: int = 30) -> Tuple[int, int]:
    upper = _now_utc() + timedelta(days=within_days)

    due_30 = db.execute(
        select(func.count(ControlEvidence.id))
        .select_from(ControlEvidence)
        .join(ControlContextLink, ControlContextLink.id == ControlEvidence.control_context_link_id)
        .where(
            ControlContextLink.scope_type == scope_type,
            ControlContextLink.scope_id == scope_id,
            ControlEvidence.valid_until.is_not(None),
            ControlEvidence.valid_until <= upper,
        )
    ).scalar_one() or 0

    overdue = db.execute(
        select(func.count(ControlEvidence.id))
        .select_from(ControlEvidence)
        .join(ControlContextLink, ControlContextLink.id == ControlEvidence.control_context_link_id)
        .where(
            ControlContextLink.scope_type == scope_type,
            ControlContextLink.scope_id == scope_id,
            ControlEvidence.valid_until.is_not(None),
            ControlEvidence.valid_until < func.now(),
        )
    ).scalar_one() or 0

    return int(due_30), int(overdue)


def _risk_mix(db: Session, scope_type: str, scope_id: int) -> DonutRisks:
    # pick the most specific appetite (scope match) or fallback to global (scope NULL)
    ap = db.query(RiskAppetitePolicy)\
        .filter(
            or_(
                and_(RiskAppetitePolicy.scope == scope_type, RiskAppetitePolicy.scope_id == scope_id),
                and_(RiskAppetitePolicy.scope.is_(None), RiskAppetitePolicy.scope_id.is_(None)),
            )
        )\
        .order_by(RiskAppetitePolicy.priority.desc())\
        .first()

    green_max = ap.green_max if ap else None
    amber_max = ap.amber_max if ap else None

    base = db.query(RiskScenarioContext.id)\
        .join(RiskScore, RiskScore.risk_scenario_context_id == RiskScenarioContext.id)\
        .filter(
            # RiskScenarioContext.scope_type == scope_type,
            # RiskScenarioContext.scope_id == scope_id,
            RiskScenarioContext.status.in_(["Open", "open"])
        )

    total = base.count()

    if green_max is None or amber_max is None:
        # no thresholds → return only total open
        return DonutRisks(low=0, medium=0, high=0, open_total=int(total))

    low = base.filter(RiskScore.residual_score <= green_max).count()
    med = base.filter(RiskScore.residual_score > green_max, RiskScore.residual_score <= amber_max).count()
    high = base.filter(RiskScore.residual_score > amber_max).count()

    return DonutRisks(low=int(low), medium=int(med), high=int(high), open_total=int(total))


def _assets_counts(db: Session, scope_type: str, scope_id: int) -> Tuple[int, int]:
    """
    Counting by scope via foreign keys on Asset:
      - entity → scope_type 'entity'
      - business_unit → 'bu'
      - site → 'site'
    For now, for scope_type 'org', we treat it as entity-level with the same id (as in your data).
    """
    filt = []
    if scope_type == "entity" or scope_type == "org":
        filt.append(Asset.entity_id == scope_id)
    elif scope_type == "bu":
        filt.append(Asset.business_unit_id == scope_id)
    elif scope_type == "site":
        filt.append(Asset.site_id == scope_id)

    total = db.query(Asset.id).filter(*filt).count()

    # critical via tag 'critical' (case-insensitive)
    critical = db.query(Asset.id)\
        .join(asset_tags_links, asset_tags_links.c.asset_id == Asset.id)\
        .join(AssetTag, AssetTag.id == asset_tags_links.c.tag_id)\
        .filter(*filt, AssetTag.name.ilike("critical"))\
        .distinct().count()

    return int(total), int(critical)


# -------------------- Framework coverage --------------------

def _enabled_versions(db: Session) -> List[FrameworkVersion]:
    return list(db.query(FrameworkVersion).all())  # include all; 'enabled' flag exposed per row


def compute_overview_summary(db: Session, *, scope_type: str = "org", scope_id: int = 1) -> OverviewSummary:
    versions = _enabled_versions(db)

    frameworks: List[FrameworkRow] = []
    enabled_coverages: List[float] = []
    latest_ts = None

    for v in versions:
        cs = compute_coverage_summary(db, version_id=v.id, scope_type=scope_type, scope_id=scope_id)
        frameworks.append(FrameworkRow(
            version_id=v.id,
            framework_code=getattr(v, "code", None),
            framework_name=v.framework.name if hasattr(v, "framework") and v.framework else None,
            framework_version_label=v.version_label,
            enabled=bool(getattr(v, "enabled", True)),
            coverage_pct=float(cs.coverage_pct or 0.0),
            last_computed_at=cs.last_computed_at,
        ))
        if getattr(v, "enabled", True):
            enabled_coverages.append(float(cs.coverage_pct or 0.0))
        if cs.last_computed_at and (latest_ts is None or cs.last_computed_at > latest_ts):
            latest_ts = cs.last_computed_at

    avg_cov = round(sum(enabled_coverages) / max(len(enabled_coverages), 1), 2)

    due30, overdue = _evidence_due_counts(db, scope_type, scope_id)
    risks = _risk_mix(db, scope_type, scope_id)
    assets_total, assets_critical = _assets_counts(db, scope_type, scope_id)

    kpis = KPIs(
        open_risks=risks.open_total, high_count=risks.high, medium_count=risks.medium, low_count=risks.low,
        avg_coverage_pct=avg_cov,
        evidence_due_30d=due30, evidence_overdue=overdue,
        exceptions_pending=0,  # (wire later if you want exception queue here)
        assets_total=assets_total, assets_critical=assets_critical,
    )

    return OverviewSummary(
        scope_type=scope_type,
        scope_id=scope_id,
        as_of=latest_ts or _now_utc(),
        kpis=kpis,
        controls_status=_controls_status_counts(db, scope_type, scope_id),
        soa_applicability=_soa_applicability_counts(db, scope_type, scope_id),
        risks_mix=risks,
        frameworks=frameworks,
    )
