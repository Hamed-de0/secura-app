from sqlalchemy import Column, Integer, ForeignKey, String
from sqlalchemy.orm import relationship
from app.core.base import BaseModel
from app.core.mixins import NameDescriptionMixin


class AssetSecurityProfile(BaseModel, NameDescriptionMixin):
    __tablename__ = 'asset_security_profiles'

    asset_id = Column(Integer, ForeignKey('assets.id'), unique=True)
    confidentiality = Column(Integer)
    integrity = Column(Integer)
    availability = Column(Integer)
    classification = Column(String(50))

    asset = relationship("Asset", back_populates="profile")
