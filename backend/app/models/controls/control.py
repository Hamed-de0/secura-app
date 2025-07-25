from sqlalchemy import Column, String, Integer, Text, DateTime, func, ForeignKey
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import relationship
from sqlalchemy.types import Enum as SqlEnum
from app.core.base import BaseModel
from app.core.mixins import NameDescriptionMixin
from app.core.enums import ControlType, ControlStatus


class Control(BaseModel, NameDescriptionMixin):
    __tablename__ = "controls"

    type = Column(SqlEnum(ControlType), nullable=False)
    status = Column(SqlEnum(ControlStatus), default=ControlStatus.proposed)

    standard_refs = Column(ARRAY(String), nullable=True)
    owner_id = Column(Integer, ForeignKey("persons.id"), nullable=True)

    # relationships
    owner = relationship("Person", back_populates="controls", lazy="joined", uselist=False)
    risks = relationship("ControlRiskLink", back_populates="control", cascade="all, delete-orphan")
    threats = relationship("ControlThreatLink", back_populates="control", cascade="all, delete-orphan")
    vulnerabilities = relationship("ControlVulnerabilityLink", back_populates="control", cascade="all, delete-orphan")
    assets = relationship("ControlAssetLink", back_populates="control", cascade="all, delete-orphan")


