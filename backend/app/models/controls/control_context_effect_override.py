from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.base import Base

class ControlContextEffectOverride(Base):
    __tablename__ = "control_context_effect_overrides"

    id = Column(Integer, primary_key=True)
    risk_scenario_context_id = Column(Integer, ForeignKey("risk_scenario_contexts.id", ondelete="CASCADE"), nullable=False)
    control_id = Column(Integer, ForeignKey("controls.id", ondelete="CASCADE"), nullable=False)
    domain_id = Column(Integer, ForeignKey("impact_domains.id", ondelete="CASCADE"), nullable=False)

    score_override = Column(Float, nullable=False)  # 0..1 scale (if your template is 0..5, we’ll scale in service)
    last_tested_at = Column(DateTime, nullable=True)

    context = relationship("RiskScenarioContext", backref="control_effect_overrides")
    control = relationship("Control")
    domain = relationship("ImpactDomain")

    __table_args__ = (
        UniqueConstraint("risk_scenario_context_id", "control_id", "domain_id", name="uq_ctx_override"),
    )
