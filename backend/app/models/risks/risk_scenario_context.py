# Core scenario logic
from sqlalchemy import Column, Integer, String, ForeignKey, ARRAY, CheckConstraint, UniqueConstraint
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
    asset_type_id = Column(Integer, ForeignKey("asset_types.id"), nullable=True)

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

    asset = relationship("Asset", backref="risk_scenario_contexts")
    asset_group = relationship("AssetGroup", backref="risk_scenario_contexts")
    asset_tag = relationship("AssetTag", backref="risk_scenario_contexts")
    asset_type = relationship("AssetType", backref="risk_scenario_contexts")  # NEW

    # Inside RiskScenarioContext class
    score = relationship("RiskScore", back_populates="context", uselist=False, cascade="all, delete-orphan")
    score_history = relationship("RiskScoreHistory", back_populates="context", cascade="all, delete-orphan")


    __table_args__ = (
        # Exactly one scope not null (Postgres-specific cast to int)
        CheckConstraint(
            "((asset_id IS NOT NULL)::int + (asset_group_id IS NOT NULL)::int + "
            "(asset_tag_id IS NOT NULL)::int + (asset_type_id IS NOT NULL)::int) = 1",
            name="ck_rsc_exactly_one_scope"
        ),
        # Prevent duplicates per scope
        UniqueConstraint("risk_scenario_id", "asset_id", name="uq_rsc_asset"),
        UniqueConstraint("risk_scenario_id", "asset_group_id", name="uq_rsc_group"),
        UniqueConstraint("risk_scenario_id", "asset_tag_id", name="uq_rsc_tag"),
        UniqueConstraint("risk_scenario_id", "asset_type_id", name="uq_rsc_type"),
    )