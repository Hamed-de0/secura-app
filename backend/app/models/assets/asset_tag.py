from sqlalchemy import Column, Integer, ForeignKey, Table, String
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

    category = Column(String(100), nullable=True)  # ← NEW

    assets = relationship(
        'Asset',
        secondary=asset_tags_links,
        back_populates='tags'
    )

    risk_scenarios = relationship(
        "RiskScenario",
        secondary="risk_scenario_tags",
        back_populates="asset_tags"
    )
