from sqlalchemy import Column, Integer, ForeignKey, String, DateTime
from sqlalchemy.orm import relationship
from app.core.base import BaseModel
from app.core.mixins import NameDescriptionMixin
from datetime import datetime, timezone


class AssetScan(BaseModel, NameDescriptionMixin):
    __tablename__ = 'asset_scans'

    asset_id = Column(Integer, ForeignKey('assets.id'))
    scanner = Column(String(100))
    status = Column(String(50))
    scan_date = Column(DateTime, default=datetime.now(timezone.utc))
    vulns_found = Column(Integer)
    report_url = Column(String(255))

    asset = relationship("Asset", back_populates="scans")
