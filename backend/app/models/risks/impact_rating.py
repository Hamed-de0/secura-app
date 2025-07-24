# Link between risk + domain + score
from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.core.base import BaseModel

class ImpactRating(BaseModel):
    __tablename__ = "impact_ratings"

    scenario_id = Column(Integer, ForeignKey("risk_scenarios.id"))
    domain_id = Column(Integer, ForeignKey("impact_domains.id"))
    score = Column(Integer, nullable=False)  # 1–5 or 0–10 scale

    domain = relationship("ImpactDomain", back_populates="impacts")
    scenario = relationship("RiskScenario", back_populates="impacts")
