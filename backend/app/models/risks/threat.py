from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ARRAY
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base


class Threat(Base):
    __tablename__ = 'threats'

    id = Column(Integer, primary_key=True)
    name = Column(String(200), nullable=False)
    category = Column(String(100))  # e.g., "Human", "Technical", "Environmental"
    description = Column(Text)
    source = Column(String(100))  # e.g., "ISO 27005", "DORA", "Custom"
    reference_code = Column(String(50))  # e.g., "T001", "ISO-TH-8.3.1"
    risk_source = Column(ARRAY(String), nullable=True)
    create_at = Column(DateTime, default=datetime.now(timezone.utc))
    enabled = Column(Boolean, default=True)

    # Relationships (placeholders for now)
    vulnerabilities = relationship("VulnerabilityThreatLink", back_populates="threat")
