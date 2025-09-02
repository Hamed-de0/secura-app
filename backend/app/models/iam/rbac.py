from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, DateTime, ForeignKey, UniqueConstraint, Index
)
from sqlalchemy.orm import relationship
from app.core.base import Base

class Role(Base):
    __tablename__ = "iam_roles"
    id = Column(Integer, primary_key=True)
    key = Column(String(64), unique=True, nullable=False)   # e.g. "compliance.admin"
    title = Column(String(200), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

class Permission(Base):
    __tablename__ = "iam_permissions"
    id = Column(Integer, primary_key=True)
    action = Column(String(64), nullable=False)             # e.g. "create","update","delete","view"
    resource = Column(String(64), nullable=False)           # e.g. "evidence","exception","soa","mapping"
    __table_args__ = (UniqueConstraint("action","resource", name="uq_perm_action_resource"),)

class RolePermission(Base):
    __tablename__ = "iam_role_permissions"
    id = Column(Integer, primary_key=True)
    role_id = Column(Integer, ForeignKey("iam_roles.id", ondelete="CASCADE"), nullable=False)
    permission_id = Column(Integer, ForeignKey("iam_permissions.id", ondelete="CASCADE"), nullable=False)
    __table_args__ = (UniqueConstraint("role_id","permission_id", name="uq_role_perm"),)
    role = relationship("Role")
    permission = relationship("Permission")

class UserRoleBinding(Base):
    """
    Assign a role to a user within a specific scope (org/entity/bu/service/site/asset_group/asset_type/tag/asset).
    """
    __tablename__ = "iam_user_role_bindings"
    id = Column(Integer, primary_key=True)
    user_id = Column(String(120), nullable=False)           # store email or subject id
    role_id = Column(Integer, ForeignKey("iam_roles.id", ondelete="CASCADE"), nullable=False)
    scope_type = Column(String(32), nullable=False)         # canonical scope types
    scope_id = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        UniqueConstraint("user_id","role_id","scope_type","scope_id", name="uq_user_role_scope"),
        Index("ix_urb_user", "user_id"),
        Index("ix_urb_scope", "scope_type", "scope_id"),
    )

    role = relationship("Role")
