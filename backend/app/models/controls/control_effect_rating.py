# models/control_effect_rating.py

from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.core.base import BaseMain

class ControlEffectRating(BaseMain):
    __tablename__ = 'control_effect_rating'

    id = Column(Integer, primary_key=True)
    risk_scenario_id = Column(Integer, ForeignKey('risk_scenarios.id'))
    control_id = Column(Integer, ForeignKey('controls.id'))
    domain_id = Column(Integer, ForeignKey('impact_domains.id'))
    score = Column(Integer, default=0)  # e.g. score from 0–5

    # Optional relationships
    risk_scenario = relationship("RiskScenario")
    control = relationship("Control")
    domain = relationship("ImpactDomain")
