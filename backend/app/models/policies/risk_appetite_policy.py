from sqlalchemy import Column, Integer, String, DateTime, JSON, CheckConstraint, Index
from datetime import datetime
from app.core.base import Base  # same base you use elsewhere

# optional: centralize allowed scopes here (keeps things consistent across app)
ALLOWED_SCOPES = (
    "org",             # global (org-wide)
    "entity",          # org_entities.id
    "business_unit",   # org_business_units.id
    "site",            # org_sites.id
    "asset",           # assets.id
    "asset_group",     # asset_groups.id
    "asset_type",      # asset_types.id
    "asset_tag",       # asset_tags.id
    # extendable: "risk_scenario_category", "risk_scenario_subcategory", ...
)

class RiskAppetitePolicy(Base):
    __tablename__ = "risk_appetite_policies"

    id = Column(Integer, primary_key=True)

    # Unified scope selector (nullable = global / org-wide)
    scope = Column(String(32), nullable=True)          # one of ALLOWED_SCOPES or None
    scope_id = Column(Integer, nullable=True)          # id in the respective table; null for "org"

    # Domain: 'C','I','A','L','R' or None (total)
    domain = Column(String(1), nullable=True)

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

    __table_args__ = (
        # scope/null rules:
        CheckConstraint(
            "(scope IS NULL AND scope_id IS NULL) OR (scope IS NOT NULL AND scope_id IS NOT NULL)",
            name="rap_scope_pair_consistency"
        ),
        # (optional) limit domain values
        CheckConstraint("domain IN ('C','I','A','L','R') OR domain IS NULL", name="rap_domain_valid"),
        # indexes for fast lookups
        Index("idx_rap_scope", "scope", "scope_id"),
        Index("idx_rap_effective", "effective_from", "effective_to"),
        Index("idx_rap_priority", "priority"),
        Index("idx_rap_domain", "domain"),
    )
