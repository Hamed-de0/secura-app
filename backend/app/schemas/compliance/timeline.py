from __future__ import annotations
from typing import Optional, Literal
from pydantic import BaseModel

Kind = Literal["evidence", "exception", "mapping"]

class UnifiedTimelineItem(BaseModel):
    # consistent, sortable event
    id: str                      # composite stable id: e.g., "evid:17:1234"
    ts: str                      # ISO timestamp
    kind: Kind                   # evidence | exception | mapping
    subtype: str                 # created|verified|expired|renewed|comment|added|removed|status_changed|...
    summary: str                 # short human text
    actor: Optional[str] = None  # if present in your models
    note: Optional[str] = None   # free text / comment

    # references (all optional; filled when available)
    requirement_id: Optional[int] = None
    control_id: Optional[int] = None
    control_code: Optional[str] = None
    context_link_id: Optional[int] = None
    evidence_id: Optional[int] = None
    exception_id: Optional[int] = None
    scope_type: Optional[str] = None
    scope_id: Optional[int] = None
