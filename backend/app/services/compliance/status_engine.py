from __future__ import annotations
from datetime import datetime
from typing import Literal, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from app.common.datetime import _to_dt
from app.models.compliance.control_evidence import ControlEvidence

StatusKey = Literal["met", "partial", "gap", "unknown"]

def get_control_status(db: Session, *, context_link_id: int) -> StatusKey:
    """
    Canonical minimal derivation:
      - met: any evidence exists AND (valid_until is null or in the future)
      - unknown: otherwise
    Replace with richer logic when ready.
    """
    row = db.execute(
        select(
            func.count(ControlEvidence.id),
            func.max(ControlEvidence.valid_until),
        ).where(ControlEvidence.control_context_link_id == context_link_id)
    ).first()
    if not row:
        return "unknown"
    cnt: int = int(row[0] or 0)
    last_valid_until: Optional[datetime] = row[1]
    vu_dt = _to_dt(last_valid_until)
    if cnt and (last_valid_until is None or vu_dt >= datetime.utcnow()):
        return "met"
    return "unknown"
