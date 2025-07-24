from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base
from app.config import DB_SCHEMA

class VulnerabilityThreatLink(Base):
    __tablename__ = 'vulnerability_threat_links'
    __table_args__ = {'schema': DB_SCHEMA}

    id = Column(Integer, primary_key=True)
    threat_id = Column(Integer, ForeignKey(f'{DB_SCHEMA}.threats.id'), nullable=False)
    vulnerability_id = Column(Integer, ForeignKey(f'{DB_SCHEMA}.vulnerabilities.id'), nullable=False)

    threat = relationship("Threat", back_populates="vulnerabilities")
    vulnerability = relationship("Vulnerability", back_populates="threats")
