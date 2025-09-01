from fastapi import APIRouter, Depends, HTTPException, Path, status, UploadFile, File, Header
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.schemas.compliance.evidence import ControlEvidenceCreate, ControlEvidenceUpdate, ControlEvidenceOut , LifecycleEventIn
from app.crud.compliance import control_evidence as crud
from app.crud.evidence import lifecycle, create_artifact_db

from app.models.evidence.evidence_artifact import EvidenceArtifact  # import
from app.schemas.evidence.evidence import EvidenceArtifactOut

from app.crud.evidence import create_artifact_db  # NEW (reuse existing CRUD)


# add near top
ALLOWED_CONTENT_TYPES = {
    "application/pdf", "image/png", "image/jpeg",
    "text/plain", "text/csv", "application/json"
}
MAX_UPLOAD_BYTES = 20 * 1024 * 1024  # 20 MB
router = APIRouter(prefix="/evidence", tags=["Compliance - Evidence"])


@router.get("/artifacts/{artifact_id}", response_model=EvidenceArtifactOut, summary="Get artifact metadata")
def get_artifact_meta(artifact_id: int, db: Session = Depends(get_db)):
    obj = db.get(EvidenceArtifact, artifact_id)
    if not obj:
        from fastapi import HTTPException, status
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Artifact not found")
    return obj

@router.post("", response_model=ControlEvidenceOut)
def add_evidence(payload: ControlEvidenceCreate, db: Session = Depends(get_db)):
    obj = crud.create(db, payload)
    try:
        lifecycle.write_event(db, obj.id, 'created')
    except Exception:
        pass
    return obj

@router.get("/control/{link_id}", response_model=List[ControlEvidenceOut])
def list_evidence(link_id: int, status: str = 'active', db: Session = Depends(get_db)):
    rows = crud.list_by_link(db, link_id)
    if status and status != 'all':
        # filter by lifecycle status if present (default active)
        rows = [r for r in rows if getattr(r, 'lifecycle_status', 'active') == status]
    return rows

@router.patch("/{evidence_id}", response_model=ControlEvidenceOut)
def update_evidence(evidence_id: int, payload: ControlEvidenceUpdate, db: Session = Depends(get_db)):
    obj = crud.update(db, evidence_id, payload)
    if not obj:
        raise HTTPException(404, "Not found")
    try:
        lifecycle.write_event(db, obj.id, 'updated')
    except Exception:
        pass
    return obj

@router.delete("/{evidence_id}/", status_code=status.HTTP_204_NO_CONTENT)
def delete_evidence(evidence_id: int, db: Session = Depends(get_db)):
    ok = lifecycle.soft_delete(db, evidence_id)
    if not ok:
        raise HTTPException(404, "Not found")
    return

@router.post("/{evidence_id}/restore/", response_model=ControlEvidenceOut)
def restore_evidence(evidence_id: int, db: Session = Depends(get_db)):
    row = lifecycle.restore(db, evidence_id)
    if not row:
        raise HTTPException(404, "Not found")
    return row

@router.post("/{evidence_id}/supersede/", response_model=ControlEvidenceOut)
def supersede_evidence(evidence_id: int, replacement_id: int, db: Session = Depends(get_db)):
    row = lifecycle.supersede(db, evidence_id, replacement_id)
    if not row:
        raise HTTPException(404, "Not found")
    return row

@router.post("/{evidence_id}/artifact", summary="Upload and attach artifact to ControlEvidence")
async def upload_artifact_to_control_evidence(
    evidence_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    x_user: Optional[str] = Header(None),
):
    # Save artifact (DB-blob storage) using existing CRUD
    content = await file.read()

    # ... inside upload_artifact_to_control_evidence(...)
    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="File too large")

    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                            detail=f"Unsupported content type: {file.content_type}")

    art = create_artifact_db(
        db,
        filename=file.filename,
        content_type=file.content_type,
        blob=content,
        size=len(content),
    )

    # Update ControlEvidence.file_path to reference the artifact (simple convention)
    # NOTE: We keep it minimal; frontend can treat "artifact:{id}" as a dereference token later.
    updated = crud.update(
        db,
        evidence_id,
        ControlEvidenceUpdate(file_path=f"artifact:{art.id}")
    )
    if not updated:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Evidence not found")

    # Lifecycle event
    try:
        lifecycle.write_event(
            db,
            evidence_id,
            "artifact_uploaded",
            actor_id=None,
            notes=None,
            meta={"artifact_id": art.id, "filename": file.filename, "actor_name": (x_user or "system")},
        )
    except Exception:
        pass

    # Return artifact metadata (same shape you use in /evidence API)
    return {
        "id": art.id,
        "storage": art.storage,
        "location": art.location,
        "filename": art.filename,
        "content_type": art.content_type,
        "size": art.size,
        "sha256": art.sha256,
        "created_at": art.created_at,
    }


@router.post("/{evidence_id}/lifecycle/", status_code=status.HTTP_201_CREATED)
def add_evidence_lifecycle(
    evidence_id: int,
    payload: LifecycleEventIn,
    db: Session = Depends(get_db),
):
    ev = lifecycle.write_event(
        db,
        evidence_id,
        payload.event,
        actor_id=payload.actor_id,
        notes=payload.notes,
        meta=payload.meta,
    )
    return {
        "id": ev.id,
        "evidence_id": ev.evidence_id,
        "event": ev.event,
        "actor_id": ev.actor_id,
        "notes": ev.notes,
        "meta": ev.meta,
        "created_at": ev.created_at,
    }


@router.get("/{evidence_id}/lifecycle/")
def list_evidence_lifecycle(evidence_id: int, db: Session = Depends(get_db)):
    events = lifecycle.list_events(db, evidence_id)
    return [
        {
            'id': ev.id,
            'evidence_id': ev.evidence_id,
            'event': ev.event,
            'actor_id': ev.actor_id,
            'notes': ev.notes,
            'meta': ev.meta,
            'created_at': ev.created_at,
        }
        for ev in events
    ]
