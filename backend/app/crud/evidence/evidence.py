from __future__ import annotations
from typing import Optional, List
from sqlalchemy.orm import Session
from datetime import datetime

from app.models.evidence.evidence_item import EvidenceItem
from app.models.evidence.evidence_artifact import EvidenceArtifact

# -------- Evidence Items --------

def create_evidence_item(
    db: Session,
    *,
    link_id: int,
    submitted_by: Optional[int],
    payload,  # EvidenceItemCreate
) -> EvidenceItem:
    row = EvidenceItem(
        control_context_link_id=link_id,
        title=payload.title,
        description=payload.description,
        status="submitted",
        submitted_by=submitted_by,
        submitted_at=datetime.utcnow(),
        tags=payload.tags,
        properties=payload.properties,
        expires_at=payload.expires_at,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row

def update_evidence_item(
    db: Session,
    *,
    evidence_id: int,
    payload,  # EvidenceItemUpdate
) -> Optional[EvidenceItem]:
    row = db.query(EvidenceItem).get(evidence_id)
    if not row:
        return None
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(row, k, v)
    db.commit()
    db.refresh(row)
    return row

def get_evidence_item(db: Session, evidence_id: int) -> Optional[EvidenceItem]:
    return db.query(EvidenceItem).get(evidence_id)

def list_evidence_for_link(db: Session, link_id: int) -> List[EvidenceItem]:
    return (
        db.query(EvidenceItem)
          .filter(EvidenceItem.control_context_link_id == link_id)
          .order_by(EvidenceItem.created_at.desc())
          .all()
    )

def delete_evidence_item(db: Session, evidence_id: int) -> bool:
    row = db.query(EvidenceItem).get(evidence_id)
    if not row:
        return False
    db.delete(row)
    db.commit()
    return True

# -------- Artifacts (DB-blob fallback) --------

def create_artifact_db(
    db: Session,
    *,
    filename: str,
    content_type: Optional[str],
    blob: bytes,
    size: Optional[int],
    sha256: Optional[str] = None,
) -> EvidenceArtifact:
    art = EvidenceArtifact(
        storage="db",
        location=None,
        filename=filename,
        content_type=content_type,
        size=size or (len(blob) if blob is not None else None),
        sha256=sha256,
        blob=blob,
    )
    db.add(art)
    db.commit()
    db.refresh(art)
    return art

def attach_artifact_to_evidence(
    db: Session,
    *,
    evidence_id: int,
    artifact_id: int
) -> Optional[EvidenceItem]:
    row = db.query(EvidenceItem).get(evidence_id)
    if not row:
        return None
    row.artifact_id = artifact_id
    db.commit()
    db.refresh(row)
    return row
