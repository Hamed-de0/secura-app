# app/crud/m4/controls_catalog.py
from __future__ import annotations
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict

from app.models.controls.control import Control

def list_controls_catalog(
    db: Session,
    *,
    q: str = "",
    offset: int = 0,
    limit: int = 20,
    sort_by: str = "code",        # code | title
    sort_dir: str = "asc",        # asc | desc
):
    base = db.query(
        Control.id,
        Control.reference_code.label("code"),
        func.coalesce(Control.title_en, Control.title_de).label("title"),
    )
    if q:
        like = f"%{q.lower()}%"
        base = base.filter(
            func.lower(func.coalesce(Control.reference_code, "")).like(like) |
            func.lower(func.coalesce(Control.title_en, "")).like(like) |
            func.lower(func.coalesce(Control.title_de, "")).like(like)
        )

    total = base.count()

    desc = (sort_dir.lower() == "desc")
    if sort_by == "title":
        ttl = func.coalesce(Control.title_en, Control.title_de, "")
        base = base.order_by(ttl.desc() if desc else ttl.asc(), Control.id.asc())
    else:
        base = base.order_by(Control.reference_code.desc() if desc else Control.reference_code.asc(),
                             Control.id.asc())

    rows = base.offset(offset).limit(limit).all()
    items: List[Dict] = [{"id": r.id, "code": r.code, "title": r.title} for r in rows]
    return total, items
