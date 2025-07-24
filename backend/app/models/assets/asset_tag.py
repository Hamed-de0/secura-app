from sqlalchemy import Column, Integer, ForeignKey, Table
from sqlalchemy.orm import relationship
from app.core.base import BaseModel
from app.core.mixins import NameDescriptionMixin

asset_tags_links = Table(
    'asset_tags_links',
    BaseModel.metadata,
    Column('asset_id', Integer, ForeignKey('assets.id'), primary_key=True),
    Column('tag_id', Integer, ForeignKey('asset_tags.id'), primary_key=True),
    extend_existing=True
)

class AssetTag(BaseModel, NameDescriptionMixin):
    __tablename__ = 'asset_tags'

    assets = relationship(
        'Asset',
        secondary=asset_tags_links,
        back_populates='tags'
    )
