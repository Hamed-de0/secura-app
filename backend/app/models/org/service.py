from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSONB
from app.core.base import Base

# ---------------------------
# OrgService (optional, shared services)
# ---------------------------
class OrgService(Base):
    __tablename__ = "org_services"

    id = Column(Integer, primary_key=True)
    provider_entity_id = Column(Integer, ForeignKey("org_entities.id", ondelete="CASCADE"), nullable=False)
    provider_bu_id = Column(Integer, ForeignKey("org_business_units.id", ondelete="SET NULL"), nullable=True)

    code = Column(String(60), unique=True, nullable=False)  # e.g., ACC-SSC
    name = Column(String(200), nullable=False)
    service_type = Column(String(40), nullable=True)  # accounting|soc|it_platform|hr|legal|dpo|other
    is_active = Column(Boolean, nullable=False, default=True)

    # JSON: SLA, data_categories, subprocessors, contacts, etc.
    meta = Column(JSONB, nullable=False, default=dict)

    provider_entity = relationship("OrgEntity")
    provider_bu = relationship("OrgBusinessUnit", back_populates="services_provided")
    consumers = relationship("OrgServiceConsumer", back_populates="service", cascade="all, delete-orphan")

