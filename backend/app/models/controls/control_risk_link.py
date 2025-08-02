from sqlalchemy import Column, Integer, ForeignKey, String, Text
from sqlalchemy.orm import relationship
from app.core.base import BaseModel


class ControlRiskLink(BaseModel):
    __tablename__ = "control_risk_links"

    control_id = Column(Integer, ForeignKey("controls.id", ondelete="CASCADE"))
    risk_scenario_id = Column(Integer, ForeignKey("risk_scenarios.id", ondelete="CASCADE"))

    status = Column(String(50), default="Planned")  # or Enum
    justification = Column(Text, nullable=True)
    residual_score = Column(Integer, nullable=True)  # 0–5 scale
    effect_type = Column(String, nullable=True)  # on Likelihood, Impact, Both

    control = relationship("Control", back_populates="risks")
    risk_scenario = relationship("RiskScenario", back_populates="controls")
