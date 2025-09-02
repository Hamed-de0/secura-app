from typing import Iterable
from sqlalchemy.orm import Session
from app.crud.iam import rbac as crud

def has_permission(db: Session, *, user_id: str, action: str, resource: str, scope_type: str, scope_id: int) -> bool:
    perms = crud.permissions_for_user(db, user_id, scope_type, scope_id)
    return any(p.action == action and p.resource == resource for p in perms)

def permissions_for_user(db: Session, *, user_id: str, scope_type: str, scope_id: int) -> list[dict]:
    perms = crud.permissions_for_user(db, user_id, scope_type, scope_id)
    return [{"action": p.action, "resource": p.resource} for p in perms]
