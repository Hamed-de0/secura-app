from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.core.base import Base

class FrameworkRequirement(Base):
    __tablename__ = "framework_requirements"
    id = Column(Integer, primary_key=True)
    framework_id = Column(Integer, ForeignKey("frameworks.id", ondelete="CASCADE"), nullable=False)
    code = Column(String(64), nullable=False)         # e.g., "A.8.23", "IA-2"
    title = Column(String(255), nullable=False)
    notes = Column(String(1024), nullable=True)

    framework = relationship("Framework", backref="requirements")
    __table_args__ = (UniqueConstraint("framework_id", "code", name="uq_fw_req_code"),)
