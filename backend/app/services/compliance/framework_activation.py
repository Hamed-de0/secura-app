from datetime import datetime
from typing import List, Dict, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from app.schemas.compliance.framework_activation import (
    ActiveFrameworkVersion, ActiveFrameworksResponse
)

# Model imports — adjust paths if your project differs
from app.models.policies.framework_activation_policy import FrameworkActivationPolicy
from app.models.compliance.framework_version import FrameworkVersion
from app.models.compliance.framework import Framework

def _now_utc() -> datetime:
    return datetime.utcnow()

def _is_now_within(start, end, now: datetime) -> bool:
    if start and start > now:
        return False
    if end and end < now:
        return False
    return True

def get_active_frameworks_for_scope(
    db: Session,
    scope_type: str,
    scope_id: int,
) -> ActiveFrameworksResponse:
    """
    Resolve framework versions activated for the exact scope (no inheritance),
    ordered by policy priority (ascending) and most recently updated.
    If multiple policies map to the same framework version, keep only the best (lowest priority, latest update).
    """
    now = _now_utc()

    q = (
        db.query(
            FrameworkActivationPolicy.id.label("policy_id"),
            FrameworkActivationPolicy.priority.label("priority"),
            FrameworkActivationPolicy.start_date,
            FrameworkActivationPolicy.end_date,
            FrameworkActivationPolicy.scope_type,
            FrameworkActivationPolicy.scope_id,
            Framework.id.label("framework_id"),
            Framework.name.label("framework_name"),
            FrameworkVersion.id.label("version_id"),
            FrameworkVersion.version_label.label("version_label"),
            FrameworkActivationPolicy.updated_at.label("updated_at"),
        )
        .join(FrameworkVersion, FrameworkVersion.id == FrameworkActivationPolicy.framework_version_id)
        .join(Framework, Framework.id == FrameworkVersion.framework_id)
        .filter(
            FrameworkActivationPolicy.scope_type == scope_type,
            FrameworkActivationPolicy.scope_id == scope_id,
            FrameworkActivationPolicy.is_enabled == True,  # noqa: E712
        )
        .order_by(FrameworkActivationPolicy.priority.asc(), FrameworkActivationPolicy.updated_at.desc())
    )

    rows = q.all()

    # Deduplicate by version_id: keep the first by ordering (best priority, latest)
    best_by_version: Dict[int, Tuple] = {}
    for r in rows:
        vid = r.version_id
        if vid not in best_by_version:
            best_by_version[vid] = r

    items: List[ActiveFrameworkVersion] = []
    for r in best_by_version.values():
        active_now = _is_now_within(r.start_date, r.end_date, now)
        items.append(
            ActiveFrameworkVersion(
                policy_id=r.policy_id,
                priority=r.priority or 0,
                framework_id=r.framework_id,
                framework_name=r.framework_name,
                version_id=r.version_id,
                version_label=r.version_label,
                start_date=r.start_date,
                end_date=r.end_date,
                is_active_now=active_now,
                source_scope_type=r.scope_type,
                source_scope_id=r.scope_id,
            )
        )

    return ActiveFrameworksResponse(
        scope_type=scope_type,
        scope_id=scope_id,
        items=items,
    )
