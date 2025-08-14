from sqlalchemy import Column, Integer, ForeignKey, UniqueConstraint, String
from sqlalchemy.orm import relationship
from app.core.base import Base

class ControlFrameworkMapping(Base):
    __tablename__ = "control_framework_mappings"
    id = Column(Integer, primary_key=True)
    framework_requirement_id = Column(Integer, ForeignKey("framework_requirements.id", ondelete="CASCADE"), nullable=False)
    control_id = Column(Integer, ForeignKey("controls.id", ondelete="CASCADE"), nullable=False)
    weight = Column(Integer, nullable=False, default=100)  # 1..100
    notes = Column(String(1024), nullable=True)

    requirement = relationship("FrameworkRequirement", backref="control_mappings")
    # control relationship optional if you want: relationship("Control")
    __table_args__ = (UniqueConstraint("framework_requirement_id", "control_id", name="uq_req_ctrl"),)
