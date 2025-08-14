from sqlalchemy import Column, Integer, DateTime, ForeignKey, String
from datetime import datetime
from app.core.base import Base

class FrameworkActivationPolicy(Base):
    __tablename__ = "framework_activation_policies"

    id = Column(Integer, primary_key=True)
    framework_id = Column(Integer, ForeignKey("frameworks.id", ondelete="CASCADE"), nullable=False)

    # Scope selectors (nullable == wildcard)
    asset_type_id  = Column(Integer, ForeignKey("asset_types.id"), nullable=True)
    asset_tag_id   = Column(Integer, ForeignKey("asset_tags.id"), nullable=True)
    asset_group_id = Column(Integer, ForeignKey("asset_groups.id"), nullable=True)

    priority = Column(Integer, default=0)
    effective_from = Column(DateTime, default=datetime.utcnow)
    effective_to   = Column(DateTime, nullable=True)
    notes = Column(String(1024), nullable=True)
