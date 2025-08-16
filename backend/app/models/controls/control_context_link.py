from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint, Text, Index
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.base import Base

class ControlContextLink(Base):
    __tablename__ = "control_context_links"

    id = Column(Integer, primary_key=True)

    # now optional
    risk_scenario_context_id = Column(Integer, ForeignKey("risk_scenario_contexts.id", ondelete="CASCADE"), nullable=True)

    # NEW: decoupled scope (optional; used when not linked to a specific risk context)
    scope_type = Column(String(30), nullable=True)
    scope_id = Column(Integer, nullable=True)

    control_id = Column(Integer, ForeignKey("controls.id", ondelete="CASCADE"), nullable=False)

    assurance_status = Column(String(50), default="mapped", nullable=False)
    implemented_at = Column(DateTime, nullable=True)
    status_updated_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    notes = Column(Text, nullable=True)

    context = relationship("RiskScenarioContext", backref="control_links", lazy="joined")
    control = relationship("Control", lazy="joined")

    __table_args__ = (
        UniqueConstraint("risk_scenario_context_id", "control_id", name="uq_ctrl_ctx"),
        # Partial uniques can’t be declared with UniqueConstraint, but you may mirror it for readability:
        # We rely on the Alembic-created index 'uq_ctrl_scope' for (scope_type, scope_id, control_id) when rsc_id IS NULL.
    )

# Optional: mirror the partial index definition at model level for dev clarity (SQLAlchemy 1.4+):
Index(
    "uq_ctrl_scope",
    ControlContextLink.scope_type,
    ControlContextLink.scope_id,
    ControlContextLink.control_id,
    unique=True,
    postgresql_where=(ControlContextLink.risk_scenario_context_id.is_(None))
)