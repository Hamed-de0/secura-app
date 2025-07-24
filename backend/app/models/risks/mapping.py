from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.core.base import BaseModel

class VulnerabilityThreatLink(BaseModel):
    __tablename__ = 'vulnerability_threat_links'

    threat_id = Column(Integer, ForeignKey('threats.id'), nullable=False)
    vulnerability_id = Column(Integer, ForeignKey('vulnerabilities.id'), nullable=False)

    threat = relationship("Threat", back_populates="vulnerabilities")
    vulnerability = relationship("Vulnerability", back_populates="threats")
