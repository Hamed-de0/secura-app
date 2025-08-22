from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import Optional, Iterable, Tuple
from datetime import datetime

from app.models.policies.risk_appetite_policy import RiskAppetitePolicy, ALLOWED_SCOPES
from app.schemas.policies.risk_appetite_policy import (
    RiskAppetitePolicyCreate, RiskAppetitePolicyUpdate
)
from app.models.assets.asset import Asset  # for match helper

def create(db: Session, data: RiskAppetitePolicyCreate) -> RiskAppetitePolicy:
    row = RiskAppetitePolicy(**data.model_dump())
    db.add(row); db.commit(); db.refresh(row)
    return row

def update(db: Session, id: int, data: RiskAppetitePolicyUpdate) -> Optional[RiskAppetitePolicy]:
    row = db.query(RiskAppetitePolicy).get(id)
    if not row:
        return None
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(row, k, v)
    db.commit(); db.refresh(row)
    return row

def delete(db: Session, id: int) -> bool:
    row = db.query(RiskAppetitePolicy).get(id)
    if not row:
        return False
    db.delete(row); db.commit()
    return True

def list_(db: Session):
    return (
        db.query(RiskAppetitePolicy)
          .order_by(RiskAppetitePolicy.priority.desc(), RiskAppetitePolicy.id.asc())
          .all()
    )

# -------------------------
# Matching logic (unified scope)
# -------------------------
_SPECIFICITY = {
    "asset": 100,
    "asset_tag": 90,
    "asset_group": 80,
    "asset_type": 70,
    "site": 60,
    "business_unit": 50,
    "entity": 40,
    "org": 10,
    None: 0,  # treat explicit None same as "org" (global)
}

def _candidate_scopes_for_asset(asset: Asset) -> Iterable[Tuple[Optional[str], Optional[int], int]]:
    # global
    yield (None, None, _SPECIFICITY[None])
    yield ("org", None, _SPECIFICITY["org"])

    # asset-level
    yield ("asset", asset.id, _SPECIFICITY["asset"])

    # direct refs (if present)
    if getattr(asset, "type_id", None):  yield ("asset_type", asset.type_id, _SPECIFICITY["asset_type"])
    if getattr(asset, "group_id", None): yield ("asset_group", asset.group_id, _SPECIFICITY["asset_group"])
    if getattr(asset, "entity_id", None): yield ("entity", asset.entity_id, _SPECIFICITY["entity"])
    if getattr(asset, "business_unit_id", None): yield ("business_unit", asset.business_unit_id, _SPECIFICITY["business_unit"])
    if getattr(asset, "site_id", None): yield ("site", asset.site_id, _SPECIFICITY["site"])

    # tags (many-to-many)
    for t in getattr(asset, "tags", []) or []:
        yield ("asset_tag", t.id, _SPECIFICITY["asset_tag"])

def find_effective_for_asset(
    db: Session,
    asset_id: int,
    at_time: Optional[datetime] = None,
    domain: Optional[str] = None,  # total appetite when None
) -> Optional[RiskAppetitePolicy]:
    at_time = at_time or datetime.utcnow()
    asset = db.query(Asset).get(asset_id)
    if not asset:
        return None

    candidates = list(_candidate_scopes_for_asset(asset))

    # Build OR(filter) for the candidate (scope, scope_id) pairs plus global/null
    ors = [and_(RiskAppetitePolicy.scope == s, RiskAppetitePolicy.scope_id == sid)
           for (s, sid, _rank) in candidates if s is not None]
    ors.append(and_(RiskAppetitePolicy.scope.is_(None), RiskAppetitePolicy.scope_id.is_(None)))

    q = (
        db.query(RiskAppetitePolicy)
          .filter(or_(*ors))
          .filter(RiskAppetitePolicy.effective_from <= at_time)
          .filter(or_(RiskAppetitePolicy.effective_to.is_(None), RiskAppetitePolicy.effective_to >= at_time))
    )

    # If asking for a domain-specific cap, filter by domain; else prefer domain is NULL (total)
    if domain:
        q = q.filter(RiskAppetitePolicy.domain == domain)
    else:
        q = q.filter(RiskAppetitePolicy.domain.is_(None))

    rows = q.all()
    if not rows:
        return None

    # Rank by (specificity, priority, recency)
    def score(p: RiskAppetitePolicy):
        # find the matching candidate to get its specificity
        match_rank = 0
        for s, sid, rk in candidates:
            if (s is None and p.scope is None) or (p.scope == s and p.scope_id == sid):
                match_rank = rk
                break
        return (match_rank, p.priority or 0, p.effective_from or datetime.min)

    rows.sort(key=score, reverse=True)
    return rows[0]

def resolve_for(db: Session, *, asset, scenario=None) -> Optional[RiskAppetitePolicy]:
    now = datetime.utcnow()
    q = db.query(RiskAppetitePolicy).filter(
        (RiskAppetitePolicy.effective_from <= now),
        (RiskAppetitePolicy.effective_to.is_(None) | (RiskAppetitePolicy.effective_to >= now))
    )

    candidates = []
    for p in q.all():
        score = 0
        if getattr(p, "asset_type_id", None) and getattr(asset, "type_id", None) == p.asset_type_id:
            score += 3
        if getattr(p, "asset_tag_id", None) and any(t.id == p.asset_tag_id for t in (getattr(asset, "tags", []) or [])):
            score += 2
        # support both single group_id or list of groups
        if getattr(p, "asset_group_id", None):
            if getattr(asset, "group_id", None) == p.asset_group_id:
                score += 1
            elif any(getattr(g, "id", None) == p.asset_group_id for g in (getattr(asset, "groups", []) or [])):
                score += 1

        # include globals (no selectors) so you always have a fallback
        if score or (p.asset_type_id is None and p.asset_tag_id is None and p.asset_group_id is None):
            candidates.append((score + (p.priority or 0), p))

    if not candidates:
        return None

    candidates.sort(key=lambda x: (x[0],), reverse=True)
    return candidates[0][1]