# Dynamic impact domain list (CIA, etc.)
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ARRAY
from sqlalchemy.orm import relationship
from app.core.base import BaseModel
from app.core.mixins import NameDescriptionMixin

class ImpactDomain(BaseModel, NameDescriptionMixin):
    __tablename__ = "impact_domains"

    impacts = relationship("ImpactRating", back_populates="domain")
