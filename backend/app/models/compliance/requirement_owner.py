from __future__ import annotations
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func, UniqueConstraint, Index
from app.core.base import Base  # keep your project's Base

class RequirementOwner(Base):
    __tablename__ = "requirement_owners"

    id = Column(Integer, primary_key=True, index=True)

    framework_requirement_id = Column(
        Integer,
        ForeignKey("framework_requirements.id", ondelete="CASCADE"),
        nullable=False, index=True
    )

    scope_type = Column(String(32), nullable=False)   # org|entity|...
    scope_id   = Column(Integer, nullable=False)

    user_id = Column(Integer, nullable=False, index=True)
    role    = Column(String(16), nullable=False, default="owner")  # owner|reviewer

    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        UniqueConstraint("framework_requirement_id", "scope_type", "scope_id", "user_id", "role",
                         name="uq_requirement_owner"),
        Index("ix_requirement_owner_scope", "scope_type", "scope_id"),
    )
