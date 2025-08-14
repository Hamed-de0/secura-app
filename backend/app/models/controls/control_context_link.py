from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.base import Base

class ControlContextLink(Base):
    __tablename__ = "control_context_links"

    id = Column(Integer, primary_key=True)
    risk_scenario_context_id = Column(Integer, ForeignKey("risk_scenario_contexts.id", ondelete="CASCADE"), nullable=False)
    control_id = Column(Integer, ForeignKey("controls.id", ondelete="CASCADE"), nullable=False)

    # mapped|planning|implementing|implemented|monitoring|analyzing|evidenced|fresh|expired
    assurance_status = Column(String(50), default="mapped", nullable=False)
    implemented_at = Column(DateTime, nullable=True)
    status_updated_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    notes = Column(Text, nullable=True)


    context = relationship("RiskScenarioContext", backref="control_links", lazy="joined")
    control = relationship("Control", lazy="joined")

    __table_args__ = (
        UniqueConstraint("risk_scenario_context_id", "control_id", name="uq_ctrl_ctx"),
    )
