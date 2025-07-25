from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ARRAY
from sqlalchemy.orm import relationship
from app.core.base import BaseModel
from app.core.mixins import NameDescriptionMixin


class Threat(BaseModel, NameDescriptionMixin):
    __tablename__ = 'threats'

    category = Column(String(100))  # e.g., "Human", "Technical", "Environmental"
    source = Column(String(100))  # e.g., "ISO 27005", "DORA", "Custom"
    reference_code = Column(String(50))  # e.g., "T001", "ISO-TH-8.3.1"
    risk_source = Column(ARRAY(String), nullable=True) # "A", "E", "H" ...

    # Relationships (placeholders for now)
    vulnerabilities = relationship("VulnerabilityThreatLink", back_populates="threat")

    controls = relationship("ControlThreatLink", back_populates="threat", cascade="all, delete-orphan")
