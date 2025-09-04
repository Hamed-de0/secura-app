from sqlalchemy import Column, Integer, String, Date, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.core.base import Base

class FrameworkVersion(Base):
    __tablename__ = "framework_versions"

    id = Column(Integer, primary_key=True)
    framework_id = Column(Integer, ForeignKey("frameworks.id", ondelete="CASCADE"), nullable=False)
    version_label = Column(String(100), nullable=False)  # e.g., "2013", "2022"
    effective_from = Column(Date, nullable=True)
    effective_to = Column(Date, nullable=True)
    notes = Column(String(500), nullable=True)
    enabled = Column(Boolean, default=True)

    framework = relationship("Framework", backref="versions")
