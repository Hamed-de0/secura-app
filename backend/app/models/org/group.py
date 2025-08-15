from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Date, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSONB
from app.core.base import Base

# ---------------------------
# OrgGroup (optional layer)
# ---------------------------
class OrgGroup(Base):
    __tablename__ = "org_groups"

    id = Column(Integer, primary_key=True)
    code = Column(String(50), unique=True, nullable=False)  # e.g., VOL
    name = Column(String(200), nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)

    # optional / descriptive fields (address, website, contacts, etc.)
    meta = Column(JSONB, nullable=False, default=dict)

    entities = relationship("OrgEntity", back_populates="group")

