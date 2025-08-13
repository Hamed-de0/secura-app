from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import ARRAY
from datetime import datetime
from app.core.base import Base  # your project base

class ControlApplicabilityPolicy(Base):
    __tablename__ = "control_applicability_policies"

    id = Column(Integer, primary_key=True)
    set_type = Column(String(16), default="baseline")  # baseline | (future: conditional)

    # Scope selectors (nullable == wildcard)
    asset_type_id  = Column(Integer, ForeignKey("asset_types.id"), nullable=True)
    asset_tag_id   = Column(Integer, ForeignKey("asset_tags.id"), nullable=True)
    asset_group_id = Column(Integer, ForeignKey("asset_groups.id"), nullable=True)

    # Controls in this set (internal control IDs)
    controls_json = Column(ARRAY(Integer), nullable=False, default=list)

    priority = Column(Integer, default=0)
    effective_from = Column(DateTime, default=datetime.utcnow)
    effective_to   = Column(DateTime, nullable=True)
    notes = Column(String(1024), nullable=True)
