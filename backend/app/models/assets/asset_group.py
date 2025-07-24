from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.core.base import BaseModel
from app.core.mixins import NameDescriptionMixin

class AssetGroup(BaseModel, NameDescriptionMixin):
    __tablename__ = 'asset_groups'

    parent_id = Column(Integer, ForeignKey('asset_groups.id'), nullable=True)

    parent = relationship("AssetGroup", remote_side="AssetGroup.id")
    assets = relationship("Asset", back_populates="group")
