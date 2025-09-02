from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import select, distinct
from app.models.iam.rbac import Role, Permission, RolePermission, UserRoleBinding

# Roles
def create_role(db: Session, key: str, title: str) -> Role:
    obj = Role(key=key, title=title)
    db.add(obj); db.commit(); db.refresh(obj); return obj

def list_roles(db: Session) -> List[Role]:
    return db.execute(select(Role)).scalars().all()

# Permissions
def create_permission(db: Session, action: str, resource: str) -> Permission:
    obj = Permission(action=action, resource=resource)
    db.add(obj); db.commit(); db.refresh(obj); return obj

def list_permissions(db: Session) -> List[Permission]:
    return db.execute(select(Permission)).scalars().all()

# Role ↔ Permission
def add_role_permission(db: Session, role_id: int, permission_id: int) -> RolePermission:
    rp = RolePermission(role_id=role_id, permission_id=permission_id)
    db.add(rp); db.commit(); db.refresh(rp); return rp

def list_role_permissions(db: Session, role_id: int) -> List[Permission]:
    q = select(Permission).join(RolePermission, RolePermission.permission_id == Permission.id)\
        .where(RolePermission.role_id == role_id)
    return db.execute(q).scalars().all()

# User ↔ Role ↔ Scope
def bind_user_role(db: Session, user_id: str, role_id: int, scope_type: str, scope_id: int) -> UserRoleBinding:
    b = UserRoleBinding(user_id=user_id, role_id=role_id, scope_type=scope_type, scope_id=scope_id)
    db.add(b); db.commit(); db.refresh(b); return b

def list_user_bindings(db: Session, user_id: str) -> List[UserRoleBinding]:
    return db.execute(select(UserRoleBinding).where(UserRoleBinding.user_id == user_id)).scalars().all()

def permissions_for_user(db: Session, user_id: str, scope_type: str, scope_id: int) -> List[Permission]:
    q = (
        select(distinct(Permission.action), Permission.resource)
        .select_from(UserRoleBinding)
        .join(Role, Role.id == UserRoleBinding.role_id)
        .join(RolePermission, RolePermission.role_id == Role.id)
        .join(Permission, Permission.id == RolePermission.permission_id)
        .where(UserRoleBinding.user_id == user_id,
               UserRoleBinding.scope_type == scope_type,
               UserRoleBinding.scope_id == scope_id)
    )
    rows = db.execute(q).all()
    # rows like [('create','evidence'), ...]
    return [Permission(action=a, resource=r) for (a, r) in rows]
