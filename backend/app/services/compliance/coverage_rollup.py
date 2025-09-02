# app/services/compliance/coverage_rollup.py
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import select, func, distinct, or_
from sqlalchemy.orm import Session
from sqlalchemy.inspection import inspect as sa_inspect

from app.models.compliance.framework_requirement import FrameworkRequirement
from app.models.compliance.control_framework_mapping import ControlFrameworkMapping
from app.models.controls.control_context_link import ControlContextLink
from app.models.compliance.control_evidence import ControlEvidence

from app.services.compliance.requirements_status import valid_evidence_filters

def _now_utc():
    try:
        return datetime.now(timezone.utc)
    except Exception:
        return datetime.utcnow()


def _try_pick_col(model, *preferred, endswith: Optional[str] = None, contains: Optional[list[str]] = None):
    """
    Return a column attr from a model by trying several candidate names.
    If not found and endswith/contains are provided, heuristically pick one.
    Returns None if nothing matches.
    """
    cols = {c.key for c in sa_inspect(model).columns}
    # exact preferred matches
    for name in preferred:
        if name and name in cols:
            return getattr(model, name)

    # endswith heuristic
    if endswith:
        for k in cols:
            if k.endswith(endswith):
                return getattr(model, k)

    # contains-all heuristic
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


def coverage_rollup_by_scope_type(db: Session, version_id: int, scope_types: list[str]):
    """
    Roll up compliance by scope_type for a given framework_version_id using your schema:
      - FrameworkRequirement.framework_version_id
      - ControlFrameworkMapping.<...requirement_id...> ↔ FrameworkRequirement.id
      - ControlFrameworkMapping.<...control_id...> ↔ ControlContextLink.<...control_id...>
      - ControlEvidence.<...control_context_link_id...> ↔ ControlContextLink.id
    """
    ev_pred = valid_evidence_filters()

    # Resolve column names robustly (works with framework_requirement_id / requirement_id, etc.)
    CFM_REQ_ID = _required_col(
        ControlFrameworkMapping,
        "requirement_id",
        "framework_requirement_id",
        endswith="requirement_id",
    )
    CFM_CTRL_ID = _required_col(
        ControlFrameworkMapping,
        "control_id",
        endswith="control_id",
        contains=["control", "id"],
    )

    CCL_ID = _required_col(ControlContextLink, "id")
    CCL_CTRL_ID = _required_col(ControlContextLink, "control_id", endswith="control_id")
    # context type may be named context_type or scope_type
    CCL_CTX_TYPE = _required_col(
        ControlContextLink,
        "context_type",
        "scope_type",
        endswith="context_type",
    )

    # SoA applicability (optional column; if missing, no-op)
    CCL_APPL = _try_pick_col(ControlContextLink, "applicability")

    CE_LINK_ID = _required_col(
        ControlEvidence,
        "control_context_link_id",
        "context_link_id",
        "ccl_id",
        endswith="link_id",
    )
    CE_STATUS = _required_col(ControlEvidence, "status", "state")
    # valid_from / valid_to are optional; if missing we’ll only use status=valid
    CE_VALID_FROM = _try_pick_col(ControlEvidence, "valid_from", "effective_from", "start_date", endswith="valid_from")
    CE_VALID_TO = _try_pick_col(ControlEvidence, "valid_to", "effective_to", "end_date", endswith="valid_to")

    now = _now_utc()

    # total requirements for version
    total = db.execute(
        select(func.count(FrameworkRequirement.id))
        .where(FrameworkRequirement.framework_version_id == version_id)
    ).scalar_one()

    # unknown = requirements with NO mapping row at all
    unknown = db.execute(
        select(func.count(FrameworkRequirement.id))
        .select_from(FrameworkRequirement)
        .outerjoin(
            ControlFrameworkMapping,
            CFM_REQ_ID == FrameworkRequirement.id,
        )
        .where(
            FrameworkRequirement.framework_version_id == version_id,
            CFM_REQ_ID.is_(None),
        )
    ).scalar_one()

    # all mapped requirement ids (used to compute gap)
    mapped_req_ids = set(
        r for (r,) in db.execute(
            select(distinct(CFM_REQ_ID))
            .join(FrameworkRequirement, FrameworkRequirement.id == CFM_REQ_ID)
            .where(FrameworkRequirement.framework_version_id == version_id)
        ).all()
        if r is not None
    )
    mapped_count = len(mapped_req_ids)

    items = []
    for st in scope_types:
        # requirements that have at least one ControlContextLink at this scope_type
        reqs_with_impl = set(
            r for (r,) in db.execute(
                select(distinct(CFM_REQ_ID))
                .join(FrameworkRequirement, FrameworkRequirement.id == CFM_REQ_ID)
                .join(ControlContextLink, ControlContextLink.__table__.c[CCL_CTRL_ID.key] == CFM_CTRL_ID)
                .where(
                    FrameworkRequirement.framework_version_id == version_id,
                    ControlContextLink.__table__.c[CCL_CTX_TYPE.key] == st,
                    ev_pred,
                    *([or_(ControlContextLink.__table__.c[CCL_APPL.key].is_(None),
                            ControlContextLink.__table__.c[CCL_APPL.key] != "na")] if CCL_APPL is not None else []),
                )
            ).all()
            if r is not None
        )
        with_impl_count = len(reqs_with_impl)

        # requirements with at least one *valid* evidence now for this scope_type
        ev_filters = [CE_STATUS == "valid"]
        if CE_VALID_FROM is not None:
            ev_filters.append(or_(CE_VALID_FROM.is_(None), CE_VALID_FROM <= now))
        if CE_VALID_TO is not None:
            ev_filters.append(or_(CE_VALID_TO.is_(None), CE_VALID_TO >= now))

        reqs_met = set(
            r for (r,) in db.execute(
                select(distinct(CFM_REQ_ID))
                .join(FrameworkRequirement, FrameworkRequirement.id == CFM_REQ_ID)
                .join(ControlContextLink, ControlContextLink.__table__.c[CCL_CTRL_ID.key] == CFM_CTRL_ID)
                .join(ControlEvidence, ControlEvidence.__table__.c[CE_LINK_ID.key] == ControlContextLink.__table__.c[CCL_ID.key])
                .where(
                    FrameworkRequirement.framework_version_id == version_id,
                    ControlContextLink.__table__.c[CCL_CTX_TYPE.key] == st,
                    *ev_filters,
                    * ([or_(ControlContextLink.__table__.c[CCL_APPL.key].is_(None),
                        ControlContextLink.__table__.c[CCL_APPL.key] != "na")] if CCL_APPL is not None else []),
                )
            ).all()
            if r is not None
        )
        met_count = len(reqs_met)

        partial_count = max(with_impl_count - met_count, 0)
        gap_count = max(mapped_count - with_impl_count, 0)

        items.append({
            "scope_type": st,
            "counts": {
                "total": total,
                "unknown": unknown,
                "met": met_count,
                "partial": partial_count,
                "gap": gap_count,
            },
        })

    return {
        "version_id": version_id,
        "items": items,
        "totals": {"total": total, "unknown": unknown, "mapped": mapped_count},
    }
