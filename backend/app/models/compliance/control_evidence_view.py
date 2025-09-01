# app/models/compliance/control_evidence_view.py
from sqlalchemy import Column, Integer, String, DateTime
from app.core.base import Base


class ControlEvidenceView(Base):
    __tablename__ = "v_control_evidence"
    __table_args__ = {"extend_existing": True}
    id = Column(Integer, primary_key=True)
    control_context_link_id = Column(Integer)
    lifecycle = Column(String)          # legacy-ish
    collected_at = Column(DateTime)
    valid_until = Column(DateTime)
    artifact_id = Column(Integer)
    title = Column(String)
    description = Column(String)
    evidence_type = Column(String)
    evidence_url = Column(String)
    file_path = Column(String)
    created_by = Column(Integer)
    created_at = Column(DateTime)
    lifecycle_status = Column(String)   # valid / expired / unknown
