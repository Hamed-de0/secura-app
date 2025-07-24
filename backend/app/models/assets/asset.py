from sqlalchemy import ForeignKey, Column, Integer, String, Text, DateTime, Boolean, Table
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime, timezone


asset_tags_links = Table(
    'asset_tags_links',
    Base.metadata,
    Column('asset_id', Integer, ForeignKey('assets.id'), primary_key=True),
    Column('tag_id', Integer, ForeignKey('asset_tags.id'), primary_key=True),
    extend_existing=True
)

class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True)
    uuid = Column(String(36), unique=True)
    name = Column(String(255), nullable=False)
    type_id = Column(Integer, ForeignKey("asset_types.id"))
    group_id = Column(Integer, ForeignKey("asset_groups.id"))
    description = Column(Text)

    type = relationship("AssetType", back_populates="assets")
    group = relationship("AssetGroup", back_populates="assets")
    owners = relationship("AssetOwner", back_populates="asset", cascade="all, delete-orphan")
    relations = relationship("AssetRelation", back_populates="asset", cascade="all, delete-orphan", foreign_keys="[AssetRelation.asset_id]")
    events = relationship("AssetLifecycleEvent", back_populates="asset", cascade="all, delete-orphan")
    maintenance = relationship("AssetMaintenance", back_populates="asset", cascade="all, delete-orphan")
    scans = relationship("AssetScan", back_populates="asset", cascade="all, delete-orphan")
    profile = relationship("AssetSecurityProfile", uselist=False, back_populates="asset")

    tags = relationship(
        "AssetTag",
        secondary=asset_tags_links,
        back_populates="assets"
    )


class AssetType(Base):
    __tablename__ = 'asset_types'

    id = Column(Integer, primary_key=True)
    name = Column(String(100), unique=True, nullable=False)
    category = Column(String(100))
    description = Column(Text)
    create_at = Column(DateTime, default=datetime.now(timezone.utc))
    enabled = Column(Boolean, default=True)
    assets = relationship("Asset", back_populates="type")

class AssetGroup(Base):
    __tablename__ = 'asset_groups'

    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    parent_id = Column(Integer, ForeignKey('asset_groups.id'))
    description = Column(Text)

    parent = relationship("AssetGroup", remote_side=[id])
    assets = relationship("Asset", back_populates="group")

class AssetOwner(Base):
    __tablename__ = 'asset_owners'

    id = Column(Integer, primary_key=True)
    asset_id = Column(Integer, ForeignKey('assets.id'))
    person_id = Column(Integer, ForeignKey("persons.id"), nullable=False)
    role = Column(String(100))
    valid_from = Column(DateTime, default=datetime.now(timezone.utc))
    valid_to = Column(DateTime, nullable=True)
    description = Column(Text)

    asset = relationship("Asset", back_populates="owners")
    person = relationship("Person", backref="asset_owners")

class AssetRelation(Base):
    __tablename__ = 'asset_relations'

    id = Column(Integer, primary_key=True)
    asset_id = Column(Integer, ForeignKey('assets.id'))
    related_asset_id = Column(Integer, ForeignKey('assets.id'))
    relation_type = Column(String(100))
    description = Column(Text)

    asset = relationship("Asset", foreign_keys=[asset_id], back_populates="relations")
    related_asset = relationship("Asset", foreign_keys=[related_asset_id])
    # asset = relationship("Asset", foreign_keys=[asset_id], back_populates="relations")

class AssetLifecycleEvent(Base):
    __tablename__ = 'asset_lifecycle_events'

    id = Column(Integer, primary_key=True)
    asset_id = Column(Integer, ForeignKey('assets.id'))
    event_type = Column(String(100))
    timestamp = Column(DateTime, default=datetime.now(timezone.utc))
    description = Column(Text)

    asset = relationship("Asset", back_populates="events")

class AssetMaintenance(Base):
    __tablename__ = 'asset_maintenance'

    id = Column(Integer, primary_key=True)
    asset_id = Column(Integer, ForeignKey('assets.id'))
    maintenance_type = Column(String(100))
    performed_by = Column(String(100))
    timestamp = Column(DateTime, default=datetime.now(timezone.utc))
    description = Column(Text)

    asset = relationship("Asset", back_populates="maintenance")

class AssetScan(Base):
    __tablename__ = 'asset_scans'

    id = Column(Integer, primary_key=True)
    asset_id = Column(Integer, ForeignKey('assets.id'))
    scanner = Column(String(100))
    status = Column(String(50))
    scan_date = Column(DateTime, default=datetime.now(timezone.utc))
    vulns_found = Column(Integer)
    report_url = Column(String(255))
    description = Column(Text)

    asset = relationship("Asset", back_populates="scans")

class AssetSecurityProfile(Base):
    __tablename__ = 'asset_security_profiles'

    id = Column(Integer, primary_key=True)
    asset_id = Column(Integer, ForeignKey('assets.id'), unique=True)
    confidentiality = Column(Integer)
    integrity = Column(Integer)
    availability = Column(Integer)
    classification = Column(String(50))
    description = Column(Text)

    asset = relationship("Asset", back_populates="profile")

class AssetTag(Base):
    __tablename__ = 'asset_tags'

    id = Column(Integer, primary_key=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(String(255), nullable=True)

    assets = relationship(
        'Asset',
        secondary=asset_tags_links,
        back_populates='tags'
    )