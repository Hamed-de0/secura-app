from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class VulnerabilityThreatLink(Base):
    __tablename__ = 'vulnerability_threat_links'

    id = Column(Integer, primary_key=True)
    threat_id = Column(Integer, ForeignKey('threats.id'), nullable=False)
    vulnerability_id = Column(Integer, ForeignKey('vulnerabilities.id'), nullable=False)

    threat = relationship("Threat", back_populates="vulnerabilities")
    vulnerability = relationship("Vulnerability", back_populates="threats")
