from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, JSON, func
from sqlalchemy.orm import relationship
from app.core.base import BaseMain  # Adjust if you're using a different base class

class RiskScore(BaseMain):
    __tablename__ = "risk_scores"

    risk_scenario_context_id = Column(Integer, ForeignKey("risk_scenario_contexts.id"), unique=True, index=True)
    initial_score = Column(Float)
    residual_score = Column(Float)
    initial_by_domain = Column(JSON)
    residual_by_domain = Column(JSON)
    last_updated = Column(DateTime, default=func.now(), onupdate=func.now())

    context = relationship("RiskScenarioContext", back_populates="score", lazy="joined")


class RiskScoreHistory(BaseMain):
    __tablename__ = "risk_score_history"

    risk_scenario_context_id = Column(Integer, ForeignKey("risk_scenario_contexts.id"), index=True)
    initial_score = Column(Float)
    residual_score = Column(Float)
    initial_by_domain = Column(JSON)
    residual_by_domain = Column(JSON)
    created_at = Column(DateTime, default=func.now())

    context = relationship("RiskScenarioContext", back_populates="score_history", lazy="joined")
