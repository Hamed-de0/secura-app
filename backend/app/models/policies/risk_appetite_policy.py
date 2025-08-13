from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.base import Base  # same base you use elsewhere

class RiskAppetitePolicy(Base):
    __tablename__ = "risk_appetite_policies"

    id = Column(Integer, primary_key=True)

    # Scope selectors (nullable = wildcard)
    asset_type_id  = Column(Integer, ForeignKey("asset_types.id"), nullable=True)
    asset_tag_id   = Column(Integer, ForeignKey("asset_tags.id"), nullable=True)
    asset_group_id = Column(Integer, ForeignKey("asset_groups.id"), nullable=True)
    domain = Column(String(1), nullable=True)  # 'C','I','A','L','R' or None for total

    # Thresholds (total residual)
    green_max = Column(Integer, nullable=False)  # <= green
    amber_max = Column(Integer, nullable=False)  # <= amber, > amber = red

    # Per-domain caps (optional). Example: {"L": 10}
    domain_caps_json = Column(JSON, nullable=True)

    # Workflow SLAs
    sla_days_amber = Column(Integer, nullable=True)
    sla_days_red   = Column(Integer, nullable=True)

    priority = Column(Integer, default=0)
    effective_from = Column(DateTime, default=datetime.utcnow)
    effective_to   = Column(DateTime, nullable=True)
    notes = Column(String(1024), nullable=True)
