from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.core.base import BaseModel

class RiskContextImpactRating(BaseModel):
    __tablename__ = "risk_context_impact_ratings"

    risk_scenario_context_id = Column(Integer, ForeignKey("risk_scenario_contexts.id"))
    domain_id = Column(Integer, ForeignKey("impact_domains.id"))
    score = Column(Integer, nullable=False)

    context = relationship("RiskScenarioContext", back_populates="impact_ratings")
    domain = relationship("ImpactDomain", back_populates="risk_context_impact_ratings")
