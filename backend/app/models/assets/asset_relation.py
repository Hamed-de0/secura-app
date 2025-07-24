from sqlalchemy import ForeignKey, Column, Integer, String
from sqlalchemy.orm import relationship
from app.core.base import BaseModel
from app.core.mixins import NameDescriptionMixin

class AssetRelation(BaseModel, NameDescriptionMixin):
    __tablename__ = 'asset_relations'

    asset_id = Column(Integer, ForeignKey('assets.id'))
    related_asset_id = Column(Integer, ForeignKey('assets.id'))
    relation_type = Column(String(100))

    asset = relationship("Asset", foreign_keys=[asset_id], back_populates="relations")
    related_asset = relationship("Asset", foreign_keys=[related_asset_id])

