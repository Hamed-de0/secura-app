# app/models/compliance/obligation_atom.py
from sqlalchemy import Column, Integer, String, Text, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB, ARRAY
from sqlalchemy.orm import relationship
from app.core.base import Base

class ObligationAtom(Base):
    __tablename__ = "obligation_atoms"

    id = Column(Integer, primary_key=True)
    framework_requirement_id = Column(
        Integer, ForeignKey("framework_requirements.id", ondelete="CASCADE"), nullable=False
    )
    # Short stable key within the article: "Art.32(1)(b)" or "A2"
    atom_key = Column(String(50), nullable=False)

    # Optional semantics (start lean; you can add more later)
    role = Column(String(40), nullable=True)            # "controller" | "processor" | "both"
    obligation_text = Column(Text, nullable=False)      # your paraphrased “shall …” line
    condition = Column(Text, nullable=True)             # when / triggers
    outcome = Column(Text, nullable=True)               # what must be achieved/proved
    citation = Column(Text, nullable=True)              # pinpoint inside the article
    applicability = Column(JSONB, nullable=True)        # e.g. {"xborder": false}
    evidence_hint = Column(ARRAY(String), nullable=True)  # ["IR runbook","Regulator receipt"]
    sort_index = Column(Integer, nullable=False, default=0)

    requirement = relationship("FrameworkRequirement", backref="obligation_atoms")

    __table_args__ = (
        UniqueConstraint("framework_requirement_id", "atom_key", name="uq_atom_req_key"),
    )
