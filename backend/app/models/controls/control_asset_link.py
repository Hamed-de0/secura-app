from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.core.base import BaseModel


class ControlAssetLink(BaseModel):
    __tablename__ = "control_asset_links"

    control_id = Column(Integer, ForeignKey("controls.id", ondelete="CASCADE"))
    asset_id = Column(Integer, ForeignKey("assets.id", ondelete="CASCADE"))

    control = relationship("Control", back_populates="assets")
    asset = relationship("Asset", back_populates="controls")
