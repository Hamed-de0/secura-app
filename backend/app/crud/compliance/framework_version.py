from sqlalchemy.orm import Session
from sqlalchemy import asc, desc, func, or_
from typing import List, Optional
from app.models.compliance.framework_version import FrameworkVersion
from app.models.compliance.framework import Framework
from app.schemas.compliance.framework_version import FrameworkVersionCreate, FrameworkVersionUpdate, FrameworksWithVersions

def create(db: Session, payload: FrameworkVersionCreate) -> FrameworkVersion:
    obj = FrameworkVersion(**payload.model_dump())
    db.add(obj); db.commit(); db.refresh(obj)
    return obj

def get(db: Session, id: int) -> Optional[FrameworkVersion]:
    return db.query(FrameworkVersion).get(id)


def list_frameworks_with_versions(
        db: Session,
        offset: int = 0,
        limit: int = 50,
        sort_by: str = "framework_name",
        sort_dir: str = "asc",
        search: Optional[str] = None,
        ) -> List[FrameworksWithVersions]:
    f = Framework
    fv = FrameworkVersion

    q = (
        db.query(
            fv.id.label("version_id"),
            f.id.label("framework_id"),
            fv.version_label.label("version_label"),
            f.name.label("framework_name"),
            fv.enabled.label("enabled"),
        )
        .join(f, fv.framework_id == f.id)  # INNER JOIN; use .outerjoin(...) if needed
    )

    # optional search across framework name + version label
    if search:
        like = f"%{search}%"
        q = q.filter(or_(f.name.ilike(like), fv.label.ilike(like)))

    sort_map = {
        "version_id": fv.id,
        "framework_id": f.id,
        "version_label": fv.version_label,
        "framework_name": f.name,

    }
    order_col = sort_map.get(sort_by, f.name)
    order = desc(order_col) if sort_dir.lower() == "desc" else asc(order_col)

    rows = (
        q.order_by(order, f.id.asc(), fv.id.asc())  # stable tiebreakers
        .offset(offset)
        .limit(limit)
        .all()
    )

    # rows are SQLAlchemy Row objects; map to your Pydantic schema
    return [FrameworksWithVersions(**dict(r._mapping)) for r in rows]

def list_by_framework(db: Session, framework_id: int) -> List[FrameworkVersion]:
    return db.query(FrameworkVersion).filter_by(framework_id=framework_id).order_by(FrameworkVersion.version_label.asc()).all()

def update(db: Session, id: int, payload: FrameworkVersionUpdate) -> Optional[FrameworkVersion]:
    obj = db.query(FrameworkVersion).get(id)
    if not obj: return None
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(obj, k, v)
    db.commit(); db.refresh(obj)
    return obj

def delete(db: Session, id: int) -> bool:
    obj = db.query(FrameworkVersion).get(id)
    if not obj: return False
    db.delete(obj); db.commit()
    return True
