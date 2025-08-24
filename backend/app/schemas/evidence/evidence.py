from __future__ import annotations
from pydantic import BaseModel, Field
from typing import Optional, Dict, List
from datetime import datetime

# ---------- Artifact ----------
class EvidenceArtifactOut(BaseModel):
    id: int
    storage: str
    location: Optional[str] = None
    filename: Optional[str] = None
    content_type: Optional[str] = None
    size: Optional[int] = None
    sha256: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# ---------- Evidence Item ----------
class EvidenceItemCreate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[Dict[str, str]] = None
    properties: Optional[Dict[str, str]] = None
    expires_at: Optional[datetime] = None

class EvidenceItemUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None              # 'submitted'|'accepted'|'rejected'|'expired'
    reviewed_by: Optional[int] = None
    reviewed_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    tags: Optional[Dict[str, str]] = None
    properties: Optional[Dict[str, str]] = None
    artifact_id: Optional[int] = None

class EvidenceItemOut(BaseModel):
    id: int
    control_context_link_id: int
    title: Optional[str] = None
    description: Optional[str] = None
    status: str
    submitted_by: Optional[int] = None
    submitted_at: datetime
    reviewed_by: Optional[int] = None
    reviewed_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    tags: Optional[Dict[str, str]] = None
    properties: Optional[Dict[str, str]] = None
    artifact: Optional[EvidenceArtifactOut] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# ---------- Lists ----------
class EvidenceListOut(BaseModel):
    link_id: int
    items: List[EvidenceItemOut]
