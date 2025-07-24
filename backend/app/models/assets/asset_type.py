from sqlalchemy import Column, String
from sqlalchemy.orm import relationship
from app.core.base import BaseModel
from app.core.mixins import NameDescriptionMixin

class AssetType(BaseModel, NameDescriptionMixin):
    __tablename__ = 'asset_types'

    category = Column(String(100))
    assets = relationship("Asset", back_populates="type")
