from sqlalchemy import Column, Integer, String, ForeignKey, Date, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSONB
from app.core.base import Base

# ---------------------------------------
# OrgServiceConsumer (links service → consumers)
# ---------------------------------------
class OrgServiceConsumer(Base):
    __tablename__ = "org_service_consumers"

    id = Column(Integer, primary_key=True)
    service_id = Column(Integer, ForeignKey("org_services.id", ondelete="CASCADE"), nullable=False)

    consumer_entity_id = Column(Integer, ForeignKey("org_entities.id", ondelete="CASCADE"), nullable=False)
    consumer_bu_id = Column(Integer, ForeignKey("org_business_units.id", ondelete="SET NULL"), nullable=True)

    # semantics controlling inheritance and responsibility
    inheritance_type = Column(String(16), nullable=False, default="direct")      # direct|conditional|advisory
    responsibility = Column(String(16), nullable=False, default="shared")        # provider_owner|consumer_owner|shared

    # residual tasks, extra notes, or checklists for consumers (JSON array or complex object)
    residual_consumer_tasks = Column(JSONB, nullable=False, default=list)

    # simple contracting metadata (optional)
    agreement_type = Column(String(16), nullable=True)  # ICA|DPA|MSA|SLA|OTHER
    agreement_ref = Column(String(200), nullable=True)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    notes = Column(Text, nullable=True)

    service = relationship("OrgService", back_populates="consumers")
    consumer_entity = relationship("OrgEntity")
    consumer_bu = relationship("OrgBusinessUnit")

    __table_args__ = (
        UniqueConstraint("service_id", "consumer_entity_id", "consumer_bu_id", name="uq_service_consumer_unique"),
    )

