from __future__ import annotations
from typing import List, Optional
from datetime import datetime, timedelta, date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db

# Existing schemas we will reuse (and optionally extend)
from app.schemas.risks.risk_context_list import (
    RiskContextListItem,
    AppetiteOut,
)
from app.schemas.m4.evidence import EvidenceItemOut
from app.schemas.m4.context_controls import ContextControlOut
from app.schemas.compliance.exceptions import ComplianceExceptionOut
from pydantic import BaseModel

# Existing CRUD/services
from app.crud.risks import risk_context_list
from app.crud.m4 import evidence as crud_evidence
from app.crud.m4 import context_controls as crud_controls
from app.crud.compliance import exceptions as crud_exceptions


router = APIRouter(prefix="/dashboards", tags=["Dashboards"])


# ---------- Queue item models (extend existing schemas with optional fields) ----------

class OverAppetiteItem(RiskContextListItem):
    targetResidual: Optional[int] = None
    appetite: Optional[AppetiteOut] = None  # already present on RiskContextListItem; kept for clarity

class ReviewsDueItem(RiskContextListItem):
    slaFlag: Optional[str] = None  # e.g., OK | WARN | OVERDUE

class EvidenceOverdueItem(EvidenceItemOut):
    # freshness already included in EvidenceItemOut; keep class for symmetry
    pass

class AwaitingVerificationItem(ContextControlOut):
    verification: Optional[str] = None

class ExceptionsExpiringItem(ComplianceExceptionOut):
    pass

class RecentChangesItem(RiskContextListItem):
    pass


class RiskOpsQueuesOut(BaseModel):
    overAppetite: List[OverAppetiteItem]
    reviewsDue: List[ReviewsDueItem]
    evidenceOverdue: List[EvidenceOverdueItem]
    awaitingVerification: List[AwaitingVerificationItem]
    exceptionsExpiring: List[ExceptionsExpiringItem]
    recentChanges: List[RecentChangesItem]


def _to_iso_dt(s: Optional[str]) -> Optional[datetime]:
    if not s:
        return None
    try:
        return datetime.fromisoformat(s.replace("Z", "+00:00"))
    except Exception:
        return None


@router.get("/riskops/queues", response_model=RiskOpsQueuesOut)
@router.get("/riskops/queues/", response_model=RiskOpsQueuesOut)
def get_riskops_queues(
    db: Session = Depends(get_db),
    limit: int = Query(10, ge=1, le=100, description="Max items per queue slice"),
    horizon_days: int = Query(30, ge=1, le=365, description="Horizon for expiration and SLA windows"),
    recent_days: int = Query(7, ge=1, le=90, description="Recent updated window for changes"),
):
    # 1) Over Appetite contexts
    over_resp = risk_context_list.list_contexts(
        db,
        offset=0,
        limit=limit,
        sort_by="residual",
        sort_dir="desc",
        scope="all",
        status="all",
        search="",
        domain="all",
        over_appetite=True,
        owner_id=None,
        days=90,
    )
    over_items: List[OverAppetiteItem] = [
        OverAppetiteItem(**it) for it in (over_resp.get("items", []) if isinstance(over_resp, dict) else [])
    ][:limit]

    # 2) Reviews Due (use server overlay if provided)
    due_resp = risk_context_list.list_contexts(
        db,
        offset=0,
        limit=limit * 2,  # fetch a bit more, we'll filter to WARN/OVERDUE
        sort_by="next_review",
        sort_dir="asc",
        scope="all",
        status="all",
        search="",
        domain="all",
        over_appetite=None,
        owner_id=None,
        days=horizon_days,
    )
    _map_sla = {"OnTrack": "OK", "DueSoon": "WARN", "Overdue": "OVERDUE"}
    reviews_list: List[ReviewsDueItem] = []
    for it in (due_resp.get("items", []) if isinstance(due_resp, dict) else []):
        flag = _map_sla.get(str(it.get("reviewSLAStatus") or "").strip())
        if flag in ("WARN", "OVERDUE"):
            obj = dict(it)
            obj["slaFlag"] = flag
            reviews_list.append(ReviewsDueItem(**obj))
        if len(reviews_list) >= limit:
            break

    # 3) Evidence Overdue/Warn — sample contexts then flatten flagged evidence
    ev_resp = risk_context_list.list_contexts(
        db,
        offset=0,
        limit=limit,
        sort_by="updated_at",
        sort_dir="desc",
        scope="all",
        status="all",
        search="",
        domain="all",
        over_appetite=None,
        owner_id=None,
        days=90,
    )
    evidence_list: List[EvidenceOverdueItem] = []
    for ctx in (ev_resp.get("items", []) if isinstance(ev_resp, dict) else []):
        _, items, _ = crud_evidence.list_by_context(
            db, ctx.get("contextId"), freshness=None, offset=0, limit=200, sort_by="captured_at", sort_dir="desc"
        )
        for raw in items:
            fr = raw.get("freshness")
            if fr in ("warn", "overdue"):
                evidence_list.append(EvidenceOverdueItem(**{
                    "id": raw["id"],
                    "contextId": raw["contextId"],
                    "controlId": raw.get("controlId"),
                    "linkId": raw["linkId"],
                    "type": raw["type"],
                    "ref": raw.get("ref"),
                    "capturedAt": raw.get("capturedAt"),
                    "validUntil": raw.get("validUntil"),
                    "freshness": fr,
                }))
                if len(evidence_list) >= limit:
                    break
        if len(evidence_list) >= limit:
            break

    # 4) Controls Awaiting Verification — implemented status for recent contexts
    ctrl_resp = risk_context_list.list_contexts(
        db, offset=0, limit=limit, sort_by="updated_at", sort_dir="desc",
        scope="all", status="all", search="", domain="all", over_appetite=None, owner_id=None, days=90,
    )
    controls_list: List[AwaitingVerificationItem] = []
    for ctx in (ctrl_resp.get("items", []) if isinstance(ctrl_resp, dict) else []):
        _, rows, _ = crud_controls.list_for_context(db, ctx.get("contextId"), offset=0, limit=200, sort_by="status", sort_dir="asc")
        for r in rows:
            status = (r.get("status") or "").strip().lower()
            if status == "implemented":
                controls_list.append(AwaitingVerificationItem(**{
                    "id": r["id"],
                    "contextId": r["contextId"],
                    "controlId": r["controlId"],
                    "code": r.get("code"),
                    "title": r.get("title"),
                    "status": r.get("status") or "proposed",
                    "lastEvidenceAt": r.get("lastEvidenceAt"),
                }))
                if len(controls_list) >= limit:
                    break
        if len(controls_list) >= limit:
            break

    # 5) Exceptions expiring in horizon
    today = date.today()
    horizon_dt = today + timedelta(days=horizon_days)
    ex_all = crud_exceptions.list_exceptions(db)
    exceptions_list: List[ExceptionsExpiringItem] = []
    for ex in (ex_all or []):
        if ex.end_date and today <= ex.end_date <= horizon_dt:
            exceptions_list.append(ExceptionsExpiringItem.model_validate(ex, from_attributes=True))
            if len(exceptions_list) >= limit:
                break

    # 6) Recent changes — contexts updated within recent_days
    rc_resp = risk_context_list.list_contexts(
        db, offset=0, limit=limit * 2, sort_by="updated_at", sort_dir="desc",
        scope="all", status="all", search="", domain="all", over_appetite=None, owner_id=None, days=90,
    )
    cutoff = datetime.utcnow() - timedelta(days=recent_days)
    recent_list: List[RecentChangesItem] = []
    for it in (rc_resp.get("items", []) if isinstance(rc_resp, dict) else []):
        dt = _to_iso_dt(it.get("updatedAt"))
        if dt and dt >= cutoff:
            recent_list.append(RecentChangesItem(**it))
        if len(recent_list) >= limit:
            break

    return RiskOpsQueuesOut(
        overAppetite=over_items,
        reviewsDue=reviews_list,
        evidenceOverdue=evidence_list,
        awaitingVerification=controls_list,
        exceptionsExpiring=exceptions_list,
        recentChanges=recent_list,
    )
