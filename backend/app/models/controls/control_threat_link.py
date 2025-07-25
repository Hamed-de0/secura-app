from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.core.base import BaseModel

class ControlThreatLink(BaseModel):
    __tablename__ = "control_threat_links"

    control_id = Column(Integer, ForeignKey("controls.id", ondelete="CASCADE"))
    threat_id = Column(Integer, ForeignKey("threats.id", ondelete="CASCADE"))

    control = relationship("Control", back_populates="threats")
    threat = relationship("Threat", back_populates="controls")
