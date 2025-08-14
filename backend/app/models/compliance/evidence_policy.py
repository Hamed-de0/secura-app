# app/models/compliance/evidence_policy.py

from sqlalchemy import Column, Integer, String, Text, ForeignKey, CheckConstraint, UniqueConstraint
from sqlalchemy.orm import relationship
from app.core.base import Base

class EvidencePolicy(Base):
    __tablename__ = "evidence_policy"

    id = Column(Integer, primary_key=True)

    # Target (choose exactly one)
    control_id = Column(Integer, ForeignKey("controls.id", ondelete="CASCADE"), nullable=True)
    framework_requirement_id = Column(Integer, ForeignKey("framework_requirements.id", ondelete="CASCADE"), nullable=True)

    freshness_days = Column(Integer, nullable=False)  # e.g., 90, 180, 365
    notes = Column(Text, nullable=True)

    control = relationship("Control")
    requirement = relationship("FrameworkRequirement")

    __table_args__ = (
        # Ensure exactly one target is set
        CheckConstraint(
            "(control_id IS NOT NULL AND framework_requirement_id IS NULL) OR "
            "(control_id IS NULL AND framework_requirement_id IS NOT NULL)",
            name="ck_evp_exactly_one_target"
        ),
        # Prevent duplicate policies for the same target
        UniqueConstraint("control_id", name="uq_evp_control_once"),
        UniqueConstraint("framework_requirement_id", name="uq_evp_requirement_once"),
    )
