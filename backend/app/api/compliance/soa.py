from fastapi import APIRouter, Depends, Query, HTTPException
from typing import List, Optional
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.compliance.soa import SoAUpsertIn, SoAItemOut
from app.crud.compliance import soa as crud

router = APIRouter(prefix="/compliance/soa", tags=["Compliance - SoA"])

@router.get("", response_model=List[SoAItemOut])
def get_soa(
    version_id: Optional[int] = Query(None),
    scope_type: str = Query(..., description="org|entity|bu|service|site|asset_group|asset_type|tag|asset"),
    scope_id: int = Query(...),
    db: Session = Depends(get_db),
):
    return crud.list_soa(db, version_id=version_id, scope_type=scope_type, scope_id=scope_id)

@router.post("", response_model=dict)
def upsert_soa(payload: SoAUpsertIn, db: Session = Depends(get_db)):
    link = crud.upsert_soa(
        db,
        scope_type=payload.scope_type,
        scope_id=payload.scope_id,
        control_id=payload.control_id,
        applicability=payload.applicability,
        justification=payload.justification,
        approver=payload.approver,
        decided_at=payload.decided_at,
        expires_at=payload.expires_at,
        owner=payload.owner,
    )
    return {"ok": True, "link_id": link.id}
