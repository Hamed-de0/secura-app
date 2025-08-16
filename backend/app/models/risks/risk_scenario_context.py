# Core scenario logic
from sqlalchemy import Column, Integer, String, ForeignKey, ARRAY, CheckConstraint, UniqueConstraint
from sqlalchemy.orm import relationship
from app.core.base import BaseModel


class RiskScenarioContext(BaseModel):
    __tablename__ = "risk_scenario_contexts"

    id = Column(Integer, primary_key=True)
    risk_scenario_id = Column(Integer, ForeignKey("risk_scenarios.id"), nullable=False)

    # NEW normalized scope
    scope_type = Column(String(30), nullable=False)   # e.g., "asset","entity","service",...
    scope_id = Column(Integer, nullable=False)

    # Legacy (deprecated) columns kept temporarily for backward compatibility
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=True)
    asset_group_id = Column(Integer, ForeignKey("asset_groups.id"), nullable=True)
    asset_tag_id = Column(Integer, ForeignKey("asset_tags.id"), nullable=True)
    asset_type_id = Column(Integer, ForeignKey("asset_types.id"), nullable=True)

    # Context info (unchanged)
    lifecycle_states = Column(ARRAY(String), nullable=True)
    status = Column(String(50), default="Open")

    threat_id = Column(Integer, ForeignKey("threats.id"))
    vulnerability_id = Column(Integer, ForeignKey("vulnerabilities.id"))
    likelihood = Column(Integer)

    # Relationships (unchanged)
    risk_scenario = relationship("RiskScenario", back_populates="contexts")
    impact_ratings = relationship("RiskContextImpactRating", back_populates="context", cascade="all, delete")
    asset = relationship("Asset", backref="risk_scenario_contexts")
    asset_group = relationship("AssetGroup", backref="risk_scenario_contexts")
    asset_tag = relationship("AssetTag", backref="risk_scenario_contexts")
    asset_type = relationship("AssetType", backref="risk_scenario_contexts")

    score = relationship("RiskScore", back_populates="context", uselist=False, cascade="all, delete-orphan")
    score_history = relationship("RiskScoreHistory", back_populates="context", cascade="all, delete-orphan")
