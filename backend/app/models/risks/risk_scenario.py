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

    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=True)
    asset_group_id = Column(Integer, ForeignKey("asset_groups.id"), nullable=True)
    asset_type_id = Column(Integer, ForeignKey("asset_types.id"), nullable=True)
    lifecycle_states = Column(ARRAY(String), nullable=True)  # e.g., ["in_use", "maintenance"]
    status = Column(String(50), default="Open")  # optional default

    threat_id = Column(Integer, ForeignKey("threats.id"))
    vulnerability_id = Column(Integer, ForeignKey("vulnerabilities.id"))


    title_en = Column(String(255), nullable=False)
    title_de = Column(String(255), nullable=False)
    description_en = Column(String(1000), nullable=True)
    description_de = Column(String(1000), nullable=True)

    likelihood = Column(Integer, nullable=False)  # scale 1–5 or 0–100
    subcategory_id = Column(Integer, ForeignKey("risk_scenario_subcategories.id"))

    asset_tags = relationship("AssetTag", secondary=risk_scenario_tags, back_populates="risk_scenarios")
    subcategory = relationship("RiskScenarioSubcategory", back_populates="scenarios")
    impacts = relationship("ImpactRating", back_populates="scenario", cascade="all, delete-orphan")
    controls = relationship("ControlRiskLink", back_populates="risk_scenario", cascade="all, delete-orphan")
    group = relationship("AssetGroup")
    asset_type = relationship("AssetType")
    asset = relationship("Asset")
    threat = relationship("Threat")
    vulnerability = relationship("Vulnerability")

