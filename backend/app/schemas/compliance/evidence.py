from pydantic import BaseModel
from typing import Optional, Literal, Dict, Any
from datetime import date, datetime

EvidenceType = Literal["file","url","screenshot","report","other"]
EvidenceStatus = Literal["valid","needs_review","invalid","expired"]

# --- Lifecycle write payload ---
class LifecycleEventIn(BaseModel):
    event: str
    actor_id: Optional[int] = None
    notes: Optional[str] = None
    meta: Optional[Dict[str, Any]] = None


class ControlEvidenceCreate(BaseModel):
    control_context_link_id: int
    title: str
    description: Optional[str] = None
    evidence_type: EvidenceType = "url"
    evidence_url: Optional[str] = None
    file_path: Optional[str] = None
    collected_at: date
    valid_until: Optional[date] = None
    status: EvidenceStatus = "valid"
    created_by: Optional[str] = None

class ControlEvidenceUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    evidence_type: Optional[EvidenceType] = None
    evidence_url: Optional[str] = None
    file_path: Optional[str] = None
    collected_at: Optional[date] = None
    valid_until: Optional[date] = None
    status: Optional[EvidenceStatus] = None

class ControlEvidenceOut(BaseModel):
    id: int
    control_context_link_id: int
    title: str
    description: Optional[str]
    evidence_type: EvidenceType
    evidence_url: Optional[str]
    file_path: Optional[str]
    collected_at: date
    valid_until: Optional[date]
    status: EvidenceStatus
    created_by: Optional[str]
    created_at: datetime
    # Additive lifecycle fields (optional)
    lifecycle_status: Optional[str] = None
    supersedes_id: Optional[int] = None

    class Config:
        from_attributes = True
