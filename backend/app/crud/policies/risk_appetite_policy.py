from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.models.policies.risk_appetite_policy import RiskAppetitePolicy
from app.schemas.policies.risk_appetite_policy import (
    RiskAppetitePolicyCreate, RiskAppetitePolicyUpdate
)

def create(db: Session, data: RiskAppetitePolicyCreate) -> RiskAppetitePolicy:
    row = RiskAppetitePolicy(**data.dict())
    db.add(row); db.commit(); db.refresh(row)
    return row

def update(db: Session, id: int, data: RiskAppetitePolicyUpdate) -> Optional[RiskAppetitePolicy]:
    row = db.query(RiskAppetitePolicy).get(id)
    if not row: return None
    for k, v in data.dict(exclude_unset=True).items(): setattr(row, k, v)
    db.commit(); db.refresh(row); return row

def delete(db: Session, id: int) -> bool:
    row = db.query(RiskAppetitePolicy).get(id)
    if not row: return False
    db.delete(row); db.commit(); return True

def list(db: Session) -> List[RiskAppetitePolicy]:
    return db.query(RiskAppetitePolicy).order_by(RiskAppetitePolicy.priority.desc()).all()

def resolve_for(db: Session, *, asset, scenario=None) -> Optional[RiskAppetitePolicy]:
    now = datetime.utcnow()
    q = db.query(RiskAppetitePolicy).filter(
        (RiskAppetitePolicy.effective_from <= now),
        (RiskAppetitePolicy.effective_to.is_(None) | (RiskAppetitePolicy.effective_to >= now))
    )

    # filter by selectors (simple V1: match any provided selector)
    candidates = []
    for p in q.all():
        score = 0
        if p.asset_type_id and asset.type_id == p.asset_type_id: score += 3
        if p.asset_tag_id and any(t.id == p.asset_tag_id for t in getattr(asset, "tags", [])): score += 2
        if p.asset_group_id and any(g.id == p.asset_group_id for g in getattr(asset, "groups", [])): score += 1
        # (domain-specific rules are for domain caps; total appetite ignores p.domain)
        if score or (not p.asset_type_id and not p.asset_tag_id and not p.asset_group_id):
            candidates.append((score + p.priority, p))
    if not candidates: return None
    candidates.sort(key=lambda x: (x[0],), reverse=True)
    return candidates[0][1]
