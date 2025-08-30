from datetime import datetime
from sqlalchemy import (
    Column, Integer, DateTime, ForeignKey, String, Boolean, Index
)
from app.core.base import Base

class FrameworkActivationPolicy(Base):
    __tablename__ = "framework_activation_policies"

    id = Column(Integer, primary_key=True)

    # Activate a specific framework *version* (join to Framework via FrameworkVersion.framework_id)
    framework_version_id = Column(
        Integer,
        ForeignKey("framework_versions.id", ondelete="CASCADE"),
        nullable=False
    )

    # Generic scope selector (replaces legacy asset_type_id / asset_group_id / asset_tag_id columns)
    # Expected values for scope_type: "org", "asset_group", "asset_type", "tag", "asset"
    scope_type = Column(String(32), nullable=False)
    scope_id   = Column(Integer, nullable=False)

    # Policy behavior
    priority   = Column(Integer, default=0, nullable=False)
    is_enabled = Column(Boolean, default=True, nullable=False)

    # Activation window
    start_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    end_date   = Column(DateTime, nullable=True)

    # Audit & notes
    notes      = Column(String(1024), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

# Helpful indices
Index("ix_fap_scope", FrameworkActivationPolicy.scope_type, FrameworkActivationPolicy.scope_id)
Index("ix_fap_version", FrameworkActivationPolicy.framework_version_id)
Index("ix_fap_priority", FrameworkActivationPolicy.priority)
