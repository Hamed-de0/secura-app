# app/models/compliance/control_evidence.py

from sqlalchemy import Column, Integer, String, Text, Date, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.base import Base
from app.models.controls.control_context_link import ControlContextLink


class ControlEvidence(Base):
    __tablename__ = "control_evidence"

    id = Column(Integer, primary_key=True)
    control_context_link_id = Column(
        Integer,
        ForeignKey(f"{ControlContextLink.__tablename__}.id", ondelete="CASCADE"),
        nullable=False,
    )
    # control_context_link_id = Column(Integer, ForeignKey("control_context_link.id", ondelete="CASCADE"), nullable=False)

    title = Column(String(300), nullable=False)
    description = Column(Text, nullable=True)

    # url or file (you can support both; fill one or the other)
    evidence_type = Column(String(30), nullable=False)  # "file" | "url" | "screenshot" | "report" | ...
    evidence_url = Column(Text, nullable=True)
    file_path = Column(Text, nullable=True)

    collected_at = Column(Date, nullable=False)        # when evidence was captured
    valid_until = Column(Date, nullable=True)          # optional: explicit expiry if known

    # Existing review/status (kept for backward compatibility)
    status = Column(String(30), default="valid", nullable=False)  # valid|needs_review|invalid|expired

    # Lifecycle (additive): draft|active|superseded|retired (soft delete)
    lifecycle_status = Column(String(20), default="active", nullable=False)
    supersedes_id = Column(Integer, ForeignKey("control_evidence.id"), nullable=True)
    created_by = Column(String(120), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    link = relationship("ControlContextLink", backref="evidence")
