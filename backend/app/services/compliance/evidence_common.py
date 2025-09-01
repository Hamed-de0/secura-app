# app/services/compliance/evidence_common.py
from sqlalchemy import func, and_, or_
from app.models.evidence.evidence_item import EvidenceItem  # your existing model
from sqlalchemy import inspect

def lifecycle_log_safe(db, evidence_id, event, actor_id=None, notes=None, meta=None):
    if not _table_exists(db, "evidence_lifecycle_events"):
        return  # no-op if table not present
    # ...insert as before...

def _table_exists(db, table_name: str) -> bool:
    insp = inspect(db.bind)
    return insp.has_table(table_name)


def valid_evidence_subq(control_context_link_id_col, at_time=None):
    """Return a correlated EXISTS subquery indicating valid evidence for a CCL."""
    now = func.now() if at_time is None else at_time
    # Valid if valid_until is NULL (never expires) or in the future
    return (
        EvidenceItem.query
        .filter(EvidenceItem.control_context_link_id == control_context_link_id_col)
        .filter(
            or_(EvidenceItem.valid_until.is_(None),
                EvidenceItem.valid_until > now)
        )
        .exists()
    )
