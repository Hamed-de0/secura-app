from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime
from app.core.base import Base


class EvidenceLifecycleEvent(Base):
    __tablename__ = 'evidence_lifecycle_events'

    id = Column(Integer, primary_key=True)
    evidence_id = Column(Integer, ForeignKey('control_evidence.id', ondelete='CASCADE'), nullable=False)
    event = Column(String(50), nullable=False)  # created|updated|artifact_uploaded|superseded|retired|restored
    actor_id = Column(Integer, nullable=True)
    notes = Column(Text, nullable=True)
    meta = Column(JSONB, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

