from sqlalchemy import Column, Integer, ForeignKey, String, JSON
from sqlalchemy.orm import relationship
from app.core.base import BaseModel
from app.core.mixins import NameDescriptionMixin
from .asset_tag import asset_tags_links, AssetTag
from .asset_type import AssetType
from .asset_group import AssetGroup
from .asset_owner import AssetOwner
from .asset_relation import AssetRelation
from .asset_lifecycle import AssetLifecycleEvent
from .asset_maintenance import AssetMaintenance
from .asset_scan import AssetScan
from .asset_security_profile import AssetSecurityProfile

class Asset(BaseModel, NameDescriptionMixin):
    __tablename__ = "assets"

    type_id = Column(Integer, ForeignKey("asset_types.id"))
    group_id = Column(Integer, ForeignKey("asset_groups.id"))
    location = Column(String(1000), nullable=True)
    details = Column(JSON, nullable=True, default=lambda :{})
    entity_id = Column(Integer, ForeignKey("org_entities.id", ondelete="SET NULL"), nullable=True)
    business_unit_id = Column(Integer, ForeignKey("org_business_units.id", ondelete="SET NULL"), nullable=True)
    site_id = Column(Integer, ForeignKey("org_sites.id", ondelete="SET NULL"), nullable=True)

    type = relationship("AssetType", back_populates="assets")
    group = relationship("AssetGroup", back_populates="assets")
    owners = relationship("AssetOwner", back_populates="asset", cascade="all, delete-orphan")
    relations = relationship("AssetRelation", back_populates="asset", cascade="all, delete-orphan", foreign_keys="[AssetRelation.asset_id]")
    events = relationship("AssetLifecycleEvent", back_populates="asset", cascade="all, delete-orphan")
    maintenance = relationship("AssetMaintenance", back_populates="asset", cascade="all, delete-orphan")
    scans = relationship("AssetScan", back_populates="asset", cascade="all, delete-orphan")
    profile = relationship("AssetSecurityProfile", uselist=False, back_populates="asset")
    tags = relationship("AssetTag", secondary=asset_tags_links, back_populates="assets")
    controls = relationship("ControlAssetLink", back_populates="asset", cascade="all, delete-orphan")
    entity = relationship("OrgEntity", lazy="joined")
    business_unit = relationship("OrgBusinessUnit", lazy="joined")
    site = relationship("OrgSite", lazy="joined")
