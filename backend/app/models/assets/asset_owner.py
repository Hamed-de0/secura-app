from sqlalchemy import Column, Integer, ForeignKey, String, DateTime
from sqlalchemy.orm import relationship
from app.core.base import BaseModel
from app.core.mixins import NameDescriptionMixin
from datetime import datetime, timezone

class AssetOwner(BaseModel, NameDescriptionMixin):
    __tablename__ = 'asset_owners'

    asset_id = Column(Integer, ForeignKey('assets.id'))
    person_id = Column(Integer, ForeignKey("persons.id"), nullable=False)
    role = Column(String(100))
    valid_from = Column(DateTime, default=datetime.now(timezone.utc))
    valid_to = Column(DateTime, nullable=True)

    asset = relationship("Asset", back_populates="owners")
    person = relationship("Person", backref="asset_owners")