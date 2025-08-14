from sqlalchemy import Column, Integer, String, Text, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.core.base import Base

class FrameworkRequirement(Base):
    __tablename__ = "framework_requirements"

    id = Column(Integer, primary_key=True)

    # ⬇️ change: use version FK instead of framework FK
    framework_version_id = Column(Integer, ForeignKey("framework_versions.id", ondelete="CASCADE"), nullable=False)
    version = relationship("FrameworkVersion", backref="requirements")

    code = Column(String(200), nullable=True)
    title = Column(String(500), nullable=True)
    text = Column(Text, nullable=True)

    parent_id = Column(Integer, ForeignKey("framework_requirements.id", ondelete="SET NULL"), nullable=True)
    parent = relationship("FrameworkRequirement", remote_side=[id], backref="children")

    sort_index = Column(Integer, nullable=False, default=0)

    __table_args__ = (
        Index("ix_fwr_v_parent_sort", "framework_version_id", "parent_id", "sort_index"),
    )
