from sqlalchemy import Column, String, Integer, Text, DateTime, func, ForeignKey
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import relationship
from sqlalchemy.types import Enum as SqlEnum
from app.core.base import BaseMain
from app.core.enums import ControlType, ControlStatus


class Control(BaseMain):
    __tablename__ = "controls"

    reference_code = Column(String, unique=True)
    title_en = Column(String)
    title_de = Column(String)
    description_en = Column(Text)
    description_de = Column(Text)
    control_source = Column(String) # ISO 27001 ...
    control_type = Column(ARRAY(String))  # ["Preventive", "Corrective"]
    control_concept = Column(ARRAY(String))  # ["Identify", "Protect"]
    properties = Column(ARRAY(String))  # ["Confidentiality", "Availability"]
    capabilities = Column(ARRAY(String))  # ["Governance"]
    security_domains = Column(ARRAY(String))  # ["Resilience"]
    owner_id = Column(Integer, ForeignKey("persons.id"), nullable=True)
    category = Column(String)

    # relationships
    owner = relationship("Person", back_populates="controls", lazy="joined", uselist=False)
    risks = relationship("ControlRiskLink", back_populates="control", cascade="all, delete-orphan")
    threats = relationship("ControlThreatLink", back_populates="control", cascade="all, delete-orphan")
    vulnerabilities = relationship("ControlVulnerabilityLink", back_populates="control", cascade="all, delete-orphan")
    assets = relationship("ControlAssetLink", back_populates="control", cascade="all, delete-orphan")


