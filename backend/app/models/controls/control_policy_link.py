from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.core.base import BaseModel

# class ControlPolicyLink(BaseModel):
#     __tablename__ = "control_policy_links"
#
#     control_id = Column(Integer, ForeignKey("controls.id", ondelete="CASCADE"))
#     policy_id = Column(Integer, ForeignKey("policies.id", ondelete="CASCADE"))
#
#     control = relationship("Control", back_populates="policies")
#     policy = relationship("Policy", back_populates="controls")
