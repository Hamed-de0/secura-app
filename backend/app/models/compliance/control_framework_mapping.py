from sqlalchemy.orm import relationship
from sqlalchemy import Column, Integer, ForeignKey, UniqueConstraint, String
from sqlalchemy.dialects.postgresql import JSONB, ARRAY
from app.core.base import Base

class ControlFrameworkMapping(Base):
    __tablename__ = "control_framework_mappings"
    id = Column(Integer, primary_key=True)

    framework_requirement_id = Column(Integer, ForeignKey("framework_requirements.id", ondelete="CASCADE"), nullable=False)
    control_id = Column(Integer, ForeignKey("controls.id", ondelete="CASCADE"), nullable=False)

    # NEW: point to an atom (nullable = stays fully backward compatible)
    obligation_atom_id = Column(Integer, ForeignKey("obligation_atoms.id", ondelete="CASCADE"), nullable=True)

    # semantics (keep as simple strings now; you can switch to enums later)
    relation_type = Column(String(16), nullable=True)     # "satisfies"|"supports"|"enables"
    coverage_level = Column(String(16), nullable=True)    # "full"|"partial"|"conditional"
    applicability = Column(JSONB, nullable=True)
    evidence_hint = Column(ARRAY(String), nullable=True)
    rationale = Column(String(1024), nullable=True)

    weight = Column(Integer, nullable=False, default=100)  # existing
    notes  = Column(String(1024), nullable=True)           # existing

    requirement = relationship("FrameworkRequirement", backref="control_mappings")

    __table_args__ = (
        # Keep existing uniqueness for article-level rows (no atom)
        UniqueConstraint(
            "framework_requirement_id", "control_id",
            name="uq_req_ctrl_article_level"
        ),
        # And a second unique for atom-level rows (protects duplicates when atoms are used)
        UniqueConstraint(
            "obligation_atom_id", "control_id",
            name="uq_atom_ctrl_atom_level"
        ),
    )
