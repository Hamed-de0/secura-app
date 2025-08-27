# app/api/controls/catalog_m4.py
from __future__ import annotations
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.m4.controls_catalog import ControlsCatalogListOut
from app.crud.m4.controls_catalog import list_controls_catalog

router = APIRouter(prefix="/controls", tags=["Controls (M4)"])

@router.get("/catalog/", response_model=ControlsCatalogListOut)
def controls_catalog(
    q: str = Query("", description="Search by code or title"),
    offset: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=200),
    sort_by: str = Query("code", pattern="^(code|title)$"),
    sort_dir: str = Query("asc", pattern="^(asc|desc)$"),
    db: Session = Depends(get_db),
):
    total, items = list_controls_catalog(
        db, q=q, offset=offset, limit=limit, sort_by=sort_by, sort_dir=sort_dir
    )
    return {"total": total, "items": items}
