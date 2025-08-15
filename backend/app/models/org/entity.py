from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Date, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSONB
from app.core.base import Base

# ---------------------------
# OrgEntity (legal entity) – core
# ---------------------------
class OrgEntity(Base):
    __tablename__ = "org_entities"

    id = Column(Integer, primary_key=True)
    group_id = Column(Integer, ForeignKey("org_groups.id", ondelete="SET NULL"), nullable=True)
    code = Column(String(50), unique=True, nullable=False)  # e.g., HHC
    name = Column(String(200), nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)

    # fields used in applicability logic / calculations
    regulatory_profile = Column(JSONB, nullable=False, default=dict)  # {"gdpr_role":"controller", "dora_in_scope":false, ...}

    # optional / descriptive fields (address, registry, website, contacts, etc.)
    meta = Column(JSONB, nullable=False, default=dict)

    group = relationship("OrgGroup", back_populates="entities")
    business_units = relationship("OrgBusinessUnit", back_populates="entity")
    sites = relationship("OrgSite", back_populates="entity")

