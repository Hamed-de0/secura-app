from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Date, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSONB
from app.core.base import Base

# ---------------------------
# OrgBusinessUnit (optional)
# ---------------------------
class OrgBusinessUnit(Base):
    __tablename__ = "org_business_units"

    id = Column(Integer, primary_key=True)
    entity_id = Column(Integer, ForeignKey("org_entities.id", ondelete="CASCADE"), nullable=False)
    code = Column(String(50), nullable=False)  # unique per entity
    name = Column(String(200), nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)

    regulatory_profile = Column(JSONB, nullable=False, default=dict)
    meta = Column(JSONB, nullable=False, default=dict)  # manager_name, notes, etc.

    entity = relationship("OrgEntity", back_populates="business_units")
    services_provided = relationship("OrgService", back_populates="provider_bu")

    __table_args__ = (
        UniqueConstraint("entity_id", "code", name="uq_bu_entity_code"),
    )

