from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.iam.rbac import (
    RoleCreate, RoleOut, PermissionCreate, PermissionOut,
    RolePermissionCreate, UserRoleBindingCreate, UserRoleBindingOut, EffectivePermission
)
from app.crud.iam import rbac as crud
from app.services.iam.policy import permissions_for_user

router = APIRouter(prefix="/iam", tags=["IAM / RBAC"])

@router.post("/roles", response_model=RoleOut)
def create_role(payload: RoleCreate, db: Session = Depends(get_db)):
    return crud.create_role(db, payload.key, payload.title)

@router.get("/roles", response_model=List[RoleOut])
def list_roles(db: Session = Depends(get_db)):
    return crud.list_roles(db)

@router.post("/permissions", response_model=PermissionOut)
def create_permission(payload: PermissionCreate, db: Session = Depends(get_db)):
    return crud.create_permission(db, payload.action, payload.resource)

@router.get("/permissions", response_model=List[PermissionOut])
def list_permissions(db: Session = Depends(get_db)):
    return crud.list_permissions(db)

@router.post("/role-permissions", response_model=PermissionOut)
def add_role_perm(payload: RolePermissionCreate, db: Session = Depends(get_db)):
    rp = crud.add_role_permission(db, payload.role_id, payload.permission_id)
    # return the permission object
    perms = crud.list_role_permissions(db, payload.role_id)
    return next((p for p in perms if p.id == payload.permission_id), None)

@router.post("/bindings", response_model=UserRoleBindingOut)
def bind_user_role(payload: UserRoleBindingCreate, db: Session = Depends(get_db)):
    return crud.bind_user_role(db, payload.user_id, payload.role_id, payload.scope_type, payload.scope_id)

@router.get("/bindings", response_model=List[UserRoleBindingOut])
def list_bindings(user_id: str = Query(...), db: Session = Depends(get_db)):
    return crud.list_user_bindings(db, user_id)

@router.get("/me/permissions", response_model=List[EffectivePermission])
def my_permissions(user_id: str = Query(...), scope_type: str = Query(...), scope_id: int = Query(...), db: Session = Depends(get_db)):
    return permissions_for_user(db, user_id=user_id, scope_type=scope_type, scope_id=scope_id)
