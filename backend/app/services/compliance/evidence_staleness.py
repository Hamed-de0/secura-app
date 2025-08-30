from datetime import datetime, timedelta
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session

from app.schemas.compliance.evidence_staleness import (
    EvidenceStalenessItem,
    EvidenceStalenessResponse,
)

# --- Model imports (adjust if your paths differ) ---

from app.models.compliance.control_evidence import ControlEvidence


from app.models.controls.control_context_link import ControlContextLink

try:
    from app.models.controls.control import Control
except Exception:
    from app.models.compliance.control import Control  # type: ignore

try:
    from app.models.risks.risk_scenario_context import RiskScenarioContext
except Exception:
    from app.models.risks.context import RiskScenarioContext  # type: ignore

# Optional: if you keep freshness policy separately and want fallback calculation
try:
    from app.models.compliance.evidence_policy import EvidencePolicy
except Exception:
    EvidencePolicy = None  # type: ignore


def _resolve_valid_until(
    db: Session,
    ev: ControlEvidence,
    ctrl_link: ControlContextLink,
) -> Optional[datetime]:
    """
    Prefer explicit ev.valid_until.
    If absent and an EvidencePolicy exists (by control_id), compute from ev.collected_at + policy.max_age_days.
    Return None if cannot be resolved.
    """
    if getattr(ev, "valid_until", None):
        return ev.valid_until

    if EvidencePolicy is None:
        return None

    # Try find a policy by control_id (adjust filters if your model differs)
    pol = (
        db.query(EvidencePolicy)
        .filter(EvidencePolicy.control_id == ctrl_link.control_id)
        .order_by(EvidencePolicy.id.asc())  # if you have priority
        .first()
    )
    if not pol:
        return None

    # Accept either "max_age_days" or "valid_for_days" field names
    max_age_days = None
    for attr in ("max_age_days", "valid_for_days", "fresh_for_days"):
        if hasattr(pol, attr) and getattr(pol, attr) is not None:
            max_age_days = int(getattr(pol, attr))
            break

    if max_age_days is None or not getattr(ev, "collected_at", None):
        return None

    return ev.collected_at + timedelta(days=max_age_days)


def list_stale_or_expiring_evidence(
    db: Session,
    within_days: int = 30,
    scope_type: Optional[str] = None,
    scope_id: Optional[int] = None,
    status: Optional[str] = None,  # "expired" | "expiring_soon" | None (both)
    page: int = 1,
    size: int = 100,
) -> EvidenceStalenessResponse:
    """
    Returns evidence items whose validity is already expired OR will expire within [within_days].
    Optional scope filter via RiskScenarioContext.
    """
    now = datetime.utcnow()
    horizon = now + timedelta(days=max(within_days, 0))

    q = (
        db.query(ControlEvidence, ControlContextLink, Control, RiskScenarioContext)
        .join(ControlContextLink, ControlEvidence.control_context_link_id == ControlContextLink.id)
        .join(Control, Control.id == ControlContextLink.control_id)
        .join(RiskScenarioContext, RiskScenarioContext.id == ControlContextLink.risk_scenario_context_id)
    )

    if scope_type:
        q = q.filter(RiskScenarioContext.scope_type == scope_type)
    if scope_id is not None:
        q = q.filter(RiskScenarioContext.scope_id == scope_id)

    # We fetch a reasonable window and compute staleness in Python to support both explicit valid_until and policy-based computation.
    # For performance in very large datasets, consider adding a DB-level filter for explicit valid_until.
    q = q.order_by(ControlEvidence.id.desc())

    # Pagination (apply after ordering)
    offset = max(page - 1, 0) * max(size, 1)
    rows = q.offset(offset).limit(size).all()

    items: List[EvidenceStalenessItem] = []
    expired_count = 0
    expiring_count = 0

    for ev, link, ctrl, ctx in rows:
        valid_until = getattr(ev, "valid_until", None)
        if not valid_until:
            # Try to compute via policy if available
            valid_until = _resolve_valid_until(db, ev, link)

        if not valid_until:
            # Unknown validity -> skip for this endpoint
            continue

        days_remaining = (valid_until - now).days
        if valid_until < now:
            st = "expired"
        elif valid_until <= horizon:
            st = "expiring_soon"
        else:
            # Healthy beyond horizon; skip
            continue

        if status and st != status:
            continue

        if st == "expired":
            expired_count += 1
        else:
            expiring_count += 1

        items.append(
            EvidenceStalenessItem(
                evidence_id=ev.id,
                control_context_link_id=link.id,
                control_id=link.control_id,
                control_name=getattr(ctrl, "name", None),
                scope_type=getattr(ctx, "scope_type", None),
                scope_id=getattr(ctx, "scope_id", None),
                collected_at=getattr(ev, "collected_at", None),
                valid_until=valid_until,
                days_remaining=days_remaining,
                status=st,  # type: ignore
                uri=getattr(ev, "uri", None),
                notes=getattr(ev, "notes", None),
            )
        )

    # Sort by nearest deadline first (expired first, then soonest)
    items.sort(key=lambda x: (0 if x.status == "expired" else 1, x.valid_until or now))

    return EvidenceStalenessResponse(
        now=now,
        within_days=within_days,
        expired_count=expired_count,
        expiring_soon_count=expiring_count,
        items=items,
    )
