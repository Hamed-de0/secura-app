from sqlalchemy import Column, Integer, ForeignKey, String, DateTime
from sqlalchemy.orm import relationship
from app.core.base import BaseModel
from app.core.mixins import NameDescriptionMixin
from datetime import datetime, timezone

class AssetMaintenance(BaseModel, NameDescriptionMixin):
    __tablename__ = 'asset_maintenance'

    asset_id = Column(Integer, ForeignKey('assets.id'))
    maintenance_type = Column(String(100))
    performed_by = Column(String(100))
    timestamp = Column(DateTime, default=datetime.now(timezone.utc))

    asset = relationship("Asset", back_populates="maintenance")
