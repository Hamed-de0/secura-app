from __future__ import annotations
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select, delete
from sqlalchemy.exc import IntegrityError

from app.models.compliance.requirement_owner import RequirementOwner
from app.schemas.compliance.requirement_owner import RequirementOwnerCreate

def list_by_requirement(
    db: Session, *, requirement_id: int,
    scope_type: Optional[str] = None, scope_id: Optional[int] = None
) -> List[RequirementOwner]:
    stmt = select(RequirementOwner).where(RequirementOwner.framework_requirement_id == requirement_id)
    if scope_type:
        stmt = stmt.where(RequirementOwner.scope_type == scope_type)
    if scope_id is not None:
        stmt = stmt.where(RequirementOwner.scope_id == scope_id)
    return list(db.execute(stmt).scalars().all())

def create(db: Session, *, requirement_id: int, data: RequirementOwnerCreate) -> RequirementOwner:
    obj = RequirementOwner(
        framework_requirement_id=requirement_id,
        scope_type=data.scope_type,
        scope_id=data.scope_id,
        user_id=data.user_id,
        role=data.role,
    )
    db.add(obj)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        # idempotent-ish: return existing row if unique constraint hit
        existing = list_by_requirement(
            db,
            requirement_id=requirement_id,
            scope_type=data.scope_type,
            scope_id=data.scope_id,
        )
        for e in existing:
            if e.user_id == data.user_id and e.role == data.role:
                return e
        raise
    db.refresh(obj)
    return obj

def delete_owner(db: Session, *, owner_id: int) -> int:
    res = db.execute(delete(RequirementOwner).where(RequirementOwner.id == owner_id))
    db.commit()
    return res.rowcount or 0
