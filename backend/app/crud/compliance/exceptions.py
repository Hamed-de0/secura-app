from datetime import date
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.models.compliance.exception import ComplianceException, ComplianceExceptionComment
from app.schemas.compliance.exceptions import (
    ComplianceExceptionCreate, ComplianceExceptionUpdate, ComplianceExceptionCommentCreate
)

def create(db: Session, payload: ComplianceExceptionCreate) -> ComplianceException:
    obj = ComplianceException(**payload.model_dump())
    db.add(obj); db.commit(); db.refresh(obj)
    return obj

def get(db: Session, exc_id: int) -> Optional[ComplianceException]:
    return db.query(ComplianceException).get(exc_id)

def list_exceptions(
    db: Session,
    context_id: Optional[int] = None,
    status: Optional[str] = None,
    control_id: Optional[int] = None,
    requirement_id: Optional[int] = None,
) -> List[ComplianceException]:
    q = db.query(ComplianceException)
    if context_id is not None:
        q = q.filter(ComplianceException.risk_scenario_context_id == context_id)
    if status is not None:
        q = q.filter(ComplianceException.status == status)
    if control_id is not None:
        q = q.filter(ComplianceException.control_id == control_id)
    if requirement_id is not None:
        q = q.filter(ComplianceException.framework_requirement_id == requirement_id)
    return q.order_by(ComplianceException.created_at.desc()).all()

def update(db: Session, exc_id: int, payload: ComplianceExceptionUpdate) -> Optional[ComplianceException]:
    obj = db.query(ComplianceException).get(exc_id)
    if not obj: return None
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(obj, k, v)
    db.commit(); db.refresh(obj)
    return obj

# --- workflow transitions ---

def _activate_if_in_window(obj: ComplianceException):
    today = date.today()
    # handle open-ended window: end_date can be NULL
    in_window = (obj.start_date is not None and obj.start_date <= today) and (
        obj.end_date is None or today <= obj.end_date
    )
    if obj.status == "approved" and in_window:
        obj.status = "active"

def submit(db: Session, exc_id: int) -> Optional[ComplianceException]:
    obj = db.query(ComplianceException).get(exc_id)
    if not obj: return None
    obj.status = "submitted"
    db.commit(); db.refresh(obj)
    return obj

def approve(db: Session, exc_id: int) -> Optional[ComplianceException]:
    obj = db.query(ComplianceException).get(exc_id)
    if not obj: return None
    obj.status = "approved"
    _activate_if_in_window(obj)
    db.commit(); db.refresh(obj)
    return obj

def reject(db: Session, exc_id: int) -> Optional[ComplianceException]:
    obj = db.query(ComplianceException).get(exc_id)
    if not obj: return None
    obj.status = "rejected"
    db.commit(); db.refresh(obj)
    return obj

def withdraw(db: Session, exc_id: int) -> Optional[ComplianceException]:
    obj = db.query(ComplianceException).get(exc_id)
    if not obj: return None
    obj.status = "withdrawn"
    db.commit(); db.refresh(obj)
    return obj

def expire_due(db: Session) -> int:
    """Expire approved/active exceptions past end_date (when end_date is set)."""
    today = date.today()
    q = db.query(ComplianceException).filter(
        ComplianceException.end_date.isnot(None),
        ComplianceException.end_date < today,
        ComplianceException.status.in_(["approved","active"])
    )
    count = 0
    for obj in q.all():
        obj.status = "expired"
        count += 1
    db.commit()
    return count

# --- comments ---

def add_comment(db: Session, exc_id: int, payload: ComplianceExceptionCommentCreate) -> Optional[ComplianceExceptionComment]:
    parent = db.query(ComplianceException).get(exc_id)
    if not parent: return None
    c = ComplianceExceptionComment(exception_id=exc_id, **payload.model_dump())
    db.add(c); db.commit(); db.refresh(c)
    return c

def list_comments(db: Session, exc_id: int) -> List[ComplianceExceptionComment]:
    return (
        db.query(ComplianceExceptionComment)
        .filter(ComplianceExceptionComment.exception_id == exc_id)
        .order_by(ComplianceExceptionComment.created_at.asc())
        .all()
    )
