from sqlalchemy import Column, Integer, ForeignKey, UniqueConstraint, Text, Float
from app.core.base import Base

class AssetTypeControlLink(Base):
    __tablename__ = "asset_type_control_links"
    id = Column(Integer, primary_key=True, index=True)
    asset_type_id = Column(Integer, ForeignKey("asset_types.id", ondelete="CASCADE"))
    control_id = Column(Integer, ForeignKey("controls.id", ondelete="CASCADE"))
    score = Column(Float, nullable=True, default=0)
    justification = Column(Text, nullable=True)

    __table_args__ = (
        UniqueConstraint('asset_type_id', 'control_id', name='_asset_type_control_uc'),
    )
