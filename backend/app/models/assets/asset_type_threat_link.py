from sqlalchemy import Column, Integer, ForeignKey, UniqueConstraint
from app.core.base import Base

class AssetTypeThreatLink(Base):
    __tablename__ = "asset_type_threat_links"
    id = Column(Integer, primary_key=True, index=True)
    asset_type_id = Column(Integer, ForeignKey("asset_types.id", ondelete="CASCADE"))
    threat_id = Column(Integer, ForeignKey("threats.id", ondelete="CASCADE"))

    __table_args__ = (UniqueConstraint('asset_type_id', 'threat_id', name='_asset_type_threat_uc'),)
