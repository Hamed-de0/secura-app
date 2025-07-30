# Core scenario logic
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.base import BaseModel

class RiskScenario(BaseModel):
    __tablename__ = "risk_scenarios"

    asset_id = Column(Integer, ForeignKey("assets.id"))
    threat_id = Column(Integer, ForeignKey("threats.id"))
    vulnerability_id = Column(Integer, ForeignKey("vulnerabilities.id"))

    title_en = Column(String(255), nullable=False)
    title_de = Column(String(255), nullable=False)
    description_en = Column(String(1000), nullable=True)
    description_de = Column(String(1000), nullable=True)

    likelihood = Column(Integer, nullable=False)  # scale 1–5 or 0–100

    impacts = relationship("ImpactRating", back_populates="scenario", cascade="all, delete-orphan")
    controls = relationship("ControlRiskLink", back_populates="risk_scenario", cascade="all, delete-orphan")

    asset = relationship("Asset")
    threat = relationship("Threat")
    vulnerability = relationship("Vulnerability")

