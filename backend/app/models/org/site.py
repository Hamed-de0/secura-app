from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSONB
from app.core.base import Base

# ---------------------------
# OrgSite (optional)
# ---------------------------
class OrgSite(Base):
    __tablename__ = "org_sites"

    id = Column(Integer, primary_key=True)
    entity_id = Column(Integer, ForeignKey("org_entities.id", ondelete="CASCADE"), nullable=False)

    code = Column(String(50), nullable=False)  # unique per entity
    name = Column(String(200), nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)

    # optional: address, timezone, facility tier, etc.
    meta = Column(JSONB, nullable=False, default=dict)

    entity = relationship("OrgEntity", back_populates="sites")

    __table_args__ = (
        UniqueConstraint("entity_id", "code", name="uq_site_entity_code"),
    )

