# Core scenario logic
from sqlalchemy import Column, Integer, String, ForeignKey, ARRAY, Table
from sqlalchemy.orm import relationship
from app.core.base import Base


class RiskScenarioContext(Base):
    __tablename__ = "risk_scenario_contexts"

    id = Column(Integer, primary_key=True)
    risk_scenario_id = Column(Integer, ForeignKey("risk_scenarios.id"), nullable=False)

    # Scope (only one can be used)
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=True)
    asset_group_id = Column(Integer, ForeignKey("asset_groups.id"), nullable=True)
    asset_tag_id = Column(Integer, ForeignKey("asset_tags.id"), nullable=True)


    # Context info
    lifecycle_states = Column(ARRAY(String), nullable=True)
    status = Column(String(50), default="Open")

    # Optional: copy of threat/vulnerability/likelihood for snapshot
    threat_id = Column(Integer, ForeignKey("threats.id"))
    vulnerability_id = Column(Integer, ForeignKey("vulnerabilities.id"))
    likelihood = Column(Integer)

    # Relationships
    risk_scenario = relationship("RiskScenario", back_populates="contexts")
    impact_ratings = relationship("RiskContextImpactRating", back_populates="context", cascade="all, delete")
