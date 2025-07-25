# Core scenario logic
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.base import BaseModel

class RiskScenario(BaseModel):
    __tablename__ = "risk_scenarios"

    asset_id = Column(Integer, ForeignKey("assets.id"))
    threat_id = Column(Integer, ForeignKey("threats.id"))
    vulnerability_id = Column(Integer, ForeignKey("vulnerabilities.id"))
    likelihood = Column(Integer, nullable=False)  # scale 1–5 or 0–100
    description = Column(String(1000), nullable=True)

    impacts = relationship("ImpactRating", back_populates="scenario", cascade="all, delete-orphan")
    # Add links to asset, threat, vulnerability via relationships

    controls = relationship("ControlRiskLink", back_populates="risk_scenario", cascade="all, delete-orphan")


