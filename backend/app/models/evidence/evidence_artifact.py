# app/models/evidence/evidence_artifact.py
from app.core.base import Base
from sqlalchemy import Column, Integer, String, LargeBinary, DateTime, Boolean
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime

class EvidenceArtifact(Base):
    __tablename__ = "evidence_artifacts"
    id = Column(Integer, primary_key=True)
    storage = Column(String(16), nullable=False, default="s3")   # 's3' | 'disk' | 'db' | 'url'
    location = Column(String(512), nullable=True)                 # s3://bucket/key or /var/data/... or https://...
    filename = Column(String(256), nullable=True)
    content_type = Column(String(128), nullable=True)
    size = Column(Integer, nullable=True)
    sha256 = Column(String(64), nullable=True)
    meta = Column(JSONB, nullable=True)

    # only for storage='db' fallback
    blob = Column(LargeBinary, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
