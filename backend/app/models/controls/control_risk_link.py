from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.core.base import BaseModel


class ControlRiskLink(BaseModel):
    __tablename__ = "control_risk_links"

    control_id = Column(Integer, ForeignKey("controls.id", ondelete="CASCADE"))
    risk_scenario_id = Column(Integer, ForeignKey("risk_scenarios.id", ondelete="CASCADE"))

    control = relationship("Control", back_populates="risks")
    risk_scenario = relationship("RiskScenario", back_populates="controls")
