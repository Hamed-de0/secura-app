# Core scenario logic
from sqlalchemy import Column, Integer, String, ForeignKey, ARRAY, Table
from sqlalchemy.orm import relationship
from app.core.base import BaseModel, Base


class RiskScenario(BaseModel):
    __tablename__ = "risk_scenarios"

    risk_scenario_tags = Table(
        "risk_scenario_tags",
        Base.metadata,
        Column("risk_scenario_id", ForeignKey("risk_scenarios.id"), primary_key=True),
        Column("tag_id", ForeignKey("asset_tags.id"), primary_key=True),

    )

    status = Column(String(50), default="Open")  # optional default

    threat_id = Column(Integer, ForeignKey("threats.id"))
    vulnerability_id = Column(Integer, ForeignKey("vulnerabilities.id"))


    title_en = Column(String(255), nullable=False)
    title_de = Column(String(255), nullable=False)
    description_en = Column(String(1000), nullable=True)
    description_de = Column(String(1000), nullable=True)

    subcategory_id = Column(Integer, ForeignKey("risk_scenario_subcategories.id"))

    asset_tags = relationship("AssetTag", secondary=risk_scenario_tags, back_populates="risk_scenarios")
    subcategory = relationship("RiskScenarioSubcategory", back_populates="scenarios")
    controls = relationship("ControlRiskLink", back_populates="risk_scenario", cascade="all, delete-orphan")
    contexts = relationship("RiskScenarioContext", back_populates="risk_scenario", cascade="all, delete")

    threat = relationship("Threat")
    vulnerability = relationship("Vulnerability")

