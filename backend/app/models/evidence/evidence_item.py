# app/models/evidence/evidence_item.py
from app.core.base import Base
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, CheckConstraint, Index, Boolean
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime

class EvidenceItem(Base):
    __tablename__ = "evidence_items"
    id = Column(Integer, primary_key=True)

    # link to context-control
    control_context_link_id = Column(Integer, ForeignKey("control_context_links.id", ondelete="CASCADE"), nullable=False, index=True)

    title = Column(String(256), nullable=True)
    description = Column(String(2048), nullable=True)

    # lifecycle
    status = Column(String(16), nullable=False, default="submitted")   # 'submitted'|'accepted'|'rejected'|'expired'
    submitted_by = Column(Integer, ForeignKey("persons.id"), nullable=True)
    submitted_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    reviewed_by = Column(Integer, ForeignKey("persons.id"), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)

    tags = Column(JSONB, nullable=True)
    properties = Column(JSONB, nullable=True)

    # file/artifact
    artifact_id = Column(Integer, ForeignKey("evidence_artifacts.id", ondelete="SET NULL"), nullable=True, index=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    __table_args__ = (
        CheckConstraint("status IN ('submitted','accepted','rejected','expired')", name="evi_status_valid"),
        Index("idx_evi_link_status", "control_context_link_id", "status"),
        Index("idx_evi_expires", "expires_at"),
    )
