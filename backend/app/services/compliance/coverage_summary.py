from datetime import datetime
from sqlalchemy.orm import Session
from typing import List, Optional, Set
from sqlalchemy import select, func, distinct, or_
from sqlalchemy.inspection import inspect as sa_inspect
from app.services.compliance.coverage_effective import compute_version_effective_coverage
from app.schemas.compliance.coverage_summary import CoverageSummary, CoverageSummaryWithMeta
from app.services.compliance.requirements_status import valid_evidence_filters


# Models we’ll need to enrich the summary (imported lazily where possible)
from app.models.compliance.framework_requirement import FrameworkRequirement
from app.models.compliance.control_framework_mapping import ControlFrameworkMapping
from app.models.controls.control_context_link import ControlContextLink
from app.models.compliance.control_evidence import ControlEvidence

def _try_pick_col(model, *preferred, endswith: Optional[str] = None, contains: Optional[list[str]] = None):
    cols = {c.key for c in sa_inspect(model).columns}
    for name in preferred:
        if name and name in cols:
            return getattr(model, name)
    if endswith:
        for k in cols:
            if k.endswith(endswith):
                return getattr(model, k)
    if contains:
        for k in cols:
            if all(token in k for token in contains):
                return getattr(model, k)
    return None

def _required_col(model, *candidates, **kw):
    col = _try_pick_col(model, *candidates, **kw)
    if col is None:
        have = sorted(c.key for c in sa_inspect(model).columns)
        raise RuntimeError(f"{model.__name__}: cannot find a matching column among {have}")
    return col

def compute_coverage_summary(
    db: Session,
    version_id: int,
    scope_type: str,
    scope_id: int,
) -> CoverageSummary:
    """
    Computes KPI-style coverage summary for a framework version within a specific scope.
    Leverages the per-requirement coverage computed by coverage_effective.
    """
    fcov = compute_version_effective_coverage(
        db=db, version_id=version_id, scope_type=scope_type, scope_id=scope_id
    )

    total = len(fcov.requirements)
    if total == 0:
        return CoverageSummary(
            version_id=version_id,
            scope_type=scope_type,
            scope_id=scope_id,
            total_requirements=0,
            applicable_requirements=0,
            met=0,
            met_by_exception=0,
            partial=0,
            gap=0,
            unknown=0,
            coverage_pct=0.0,
            coverage_pct_excl_exceptions=0.0,
            avg_score=0.0,
            last_computed_at=datetime.utcnow(),
        )

    met = partial = gap = unknown = met_by_exception = 0
    score_sum = 0.0

    for r in fcov.requirements:
        score_sum += (r.score or 0.0)
        if r.status == "met":
            met += 1
            if getattr(r, "exception_applied", False):
                met_by_exception += 1
        elif r.status == "partial":
            partial += 1
        elif r.status == "gap":
            gap += 1
        else:
            unknown += 1

    applicable = total - unknown
    if applicable <= 0:
        coverage_pct = 0.0
        coverage_pct_excl_exceptions = 0.0
    else:
        coverage_pct = round((met / applicable) * 100.0, 2)
        coverage_pct_excl_exceptions = round(((met - met_by_exception) / applicable) * 100.0, 2)

    avg_score = round(score_sum / max(total, 1), 4)

    return CoverageSummary(
        version_id=version_id,
        scope_type=scope_type,
        scope_id=scope_id,
        total_requirements=total,
        applicable_requirements=applicable,
        met=met,
        met_by_exception=met_by_exception,
        partial=partial,
        gap=gap,
        unknown=unknown,
        coverage_pct=coverage_pct,
        coverage_pct_excl_exceptions=coverage_pct_excl_exceptions,
        avg_score=avg_score,
        last_computed_at=datetime.utcnow(),
    )

# --- NEW: list helper (adds identity + freshness/controls stats) -------------
def _framework_version_meta(db: Session, version_id: int) -> dict:
    """
    Fetch framework identity by version id without hard-coding column names.
    Tries common names: code/name/label/enabled. Safe to return partial data.
    """
    try:
        # Adjust import path if your model lives elsewhere
        from app.models.compliance.framework_version import FrameworkVersion
        from app.models.compliance.framework import Framework
    except Exception:
        return {}

    # row = db.query(FrameworkVersion).filter(FrameworkVersion.id == version_id).first()
    row = (db.query(
        FrameworkVersion.id.label("version_id"),
        Framework.id.label("framework_id"),
        FrameworkVersion.version_label.label("version_label"),
        Framework.name.label("framework_name"),
        FrameworkVersion.enabled.label("enabled"),
        ).join(Framework, FrameworkVersion.framework_id == Framework.id)
    ).filter(FrameworkVersion.id == version_id).first()

    if not row:
        return {}

    name = getattr(row, "framework_name", None)
    label = getattr(row, "label", None) or getattr(row, "version_label", None) or getattr(row, "version", None)
    enabled = getattr(row, "enabled", True)
    print('-------------------------CHECK1 ', name, label, enabled)
    return dict(framework_name=name, framework_version_label=label, enabled=bool(enabled))

def _controls_stats_and_freshness(
    db: Session, *, version_id: int, scope_type: str, scope_id: int
) -> dict:
    """
    controls_total           → distinct controls mapped to any requirement in this version
    controls_implemented     → those controls with a CCL at (scope_type, scope_id) and applicability != 'na'
    freshness_pct (0..1)     → among implemented controls, % that have at least one *valid now* evidence
    mapped_requirements      → distinct requirements that have at least one mapping row
    """
    ev_pred = valid_evidence_filters()

    CFM_REQ_ID = _required_col(
        ControlFrameworkMapping, "framework_requirement_id", "requirement_id", endswith="requirement_id"
    )
    CFM_CTRL_ID = _required_col(
        ControlFrameworkMapping, "control_id", endswith="control_id", contains=["control", "id"]
    )
    CCL_ID = _required_col(ControlContextLink, "id")
    CCL_CTRL_ID = _required_col(ControlContextLink, "control_id", endswith="control_id")
    CCL_CTX_TYPE = _required_col(ControlContextLink, "scope_type", "context_type", endswith="context_type")
    CCL_CTX_ID = _required_col(ControlContextLink, "scope_id", "context_id", endswith="context_id")
    CCL_APPL = _try_pick_col(ControlContextLink, "applicability")

    CE_LINK_ID = _required_col(ControlEvidence, "control_context_link_id", "context_link_id", "ccl_id", endswith="link_id")
    CE_STATUS  = _required_col(ControlEvidence, "status", "state")
    CE_VALID_FROM = _try_pick_col(ControlEvidence, "valid_from", "effective_from", "start_date", endswith="valid_from")
    CE_VALID_TO   = _try_pick_col(ControlEvidence, "valid_to", "effective_to", "end_date", endswith="valid_to")

    # requirements in version (used by mapped_requirements)
    _ = _required_col(FrameworkRequirement, "framework_version_id")  # assert presence

    mapped_req_ids = {
        r for (r,) in db.execute(
            select(distinct(CFM_REQ_ID))
            .join(FrameworkRequirement, FrameworkRequirement.id == CFM_REQ_ID)
            .where(FrameworkRequirement.framework_version_id == version_id)
        ).all() if r is not None
    }

    controls_total = db.execute(
        select(func.count(distinct(CFM_CTRL_ID)))
        .select_from(ControlFrameworkMapping)
        .join(FrameworkRequirement, FrameworkRequirement.id == CFM_REQ_ID)
        .where(FrameworkRequirement.framework_version_id == version_id)
    ).scalar_one() or 0

    # Implemented = has a CCL at this scope (and not NA if column exists)
    impl_ctrl_ids = {
        c for (c,) in db.execute(
            select(distinct(CCL_CTRL_ID))
            .join(ControlFrameworkMapping, ControlFrameworkMapping.__table__.c[CFM_CTRL_ID.key] == ControlContextLink.__table__.c[CCL_CTRL_ID.key])
            .join(FrameworkRequirement, FrameworkRequirement.id == ControlFrameworkMapping.__table__.c[CFM_REQ_ID.key])
            .where(
                FrameworkRequirement.framework_version_id == version_id,
                ControlContextLink.__table__.c[CCL_CTX_TYPE.key] == scope_type,
                ControlContextLink.__table__.c[CCL_CTX_ID.key] == scope_id,
                *([or_(ControlContextLink.__table__.c[CCL_APPL.key].is_(None),
                       ControlContextLink.__table__.c[CCL_APPL.key] != "na")] if CCL_APPL is not None else []),
            )
        ).all() if c is not None
    }
    controls_implemented = len(impl_ctrl_ids)

    # Valid evidence now per implemented control
    ev_filters = [CE_STATUS == "valid"]
    if CE_VALID_FROM is not None:
        ev_filters.append(or_(CE_VALID_FROM.is_(None), CE_VALID_FROM <= func.now()))
    if CE_VALID_TO is not None:
        ev_filters.append(or_(CE_VALID_TO.is_(None), CE_VALID_TO >= func.now()))

    impl_ctrl_with_valid_ev = {
        c for (c,) in db.execute(
            select(distinct(ControlContextLink.__table__.c[CCL_CTRL_ID.key]))
            .join(ControlEvidence, ControlEvidence.__table__.c[CE_LINK_ID.key] == ControlContextLink.__table__.c[CCL_ID.key])
            .where(
                ControlContextLink.__table__.c[CCL_CTRL_ID.key].in_(impl_ctrl_ids) if impl_ctrl_ids else False,
                *ev_filters
            )
        ).all() if c is not None
    }
    freshness_pct = (len(impl_ctrl_with_valid_ev) / controls_implemented) if controls_implemented else 0.0

    return dict(
        controls_total=int(controls_total),
        controls_implemented=int(controls_implemented),
        freshness_pct=float(round(freshness_pct, 4)),
        mapped_requirements=int(len(mapped_req_ids)),
    )

def compute_coverage_summary_list(
    db: Session,
    version_ids: List[int],
    scope_type: str,
    scope_id: int,
) -> List[CoverageSummaryWithMeta]:
    out: List[CoverageSummaryWithMeta] = []
    for vid in version_ids:
        base = compute_coverage_summary(db=db, version_id=vid, scope_type=scope_type, scope_id=scope_id)
        meta = _framework_version_meta(db, vid)
        extras = _controls_stats_and_freshness(db, version_id=vid, scope_type=scope_type, scope_id=scope_id)
        out.append(CoverageSummaryWithMeta(**base.dict(), **meta, **extras, top_gaps=[]))
    return out

