from __future__ import annotations
from typing import List, Optional, Literal, Any
from datetime import datetime
from pydantic import BaseModel

StatusLiteral = Literal["met", "partial", "gap", "unknown"]

class RequirementBasic(BaseModel):
    requirement_id: int
    code: str
    title: str
    breadcrumb: Optional[str] = None

class StatusOut(BaseModel):
    status: StatusLiteral
    score: float
    exception_applied: bool = False
    computed_at: Optional[datetime] = None

class MappingOut(BaseModel):
    control_id: int
    control_code: Optional[str] = None
    control_title: Optional[str] = None
    context_link_id: Optional[int] = None
    link_scope_type: Optional[str] = None
    link_scope_id: Optional[int] = None
    control_status: Optional[StatusLiteral] = None
    evidence_count: int = 0
    last_evidence_at: Optional[datetime] = None

class EvidenceOut(BaseModel):
    evidence_id: int
    title: Optional[str] = None
    evidence_type: Optional[str] = None
    evidence_url: Optional[str] = None
    file_path: Optional[str] = None
    collected_at: Optional[datetime] = None
    valid_until: Optional[datetime] = None
    status: Optional[str] = None

class RequirementDetailResponse(BaseModel):
    version_id: int
    scope_type: str
    scope_id: int
    requirement: RequirementBasic
    status: StatusOut
    mappings: List[MappingOut] = []
    evidence: List[EvidenceOut] = []
    exceptions: List[Any] = []
