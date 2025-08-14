from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.compliance.framework_version import FrameworkVersion
from app.schemas.compliance.framework_version import FrameworkVersionCreate, FrameworkVersionUpdate

def create(db: Session, payload: FrameworkVersionCreate) -> FrameworkVersion:
    obj = FrameworkVersion(**payload.model_dump())
    db.add(obj); db.commit(); db.refresh(obj)
    return obj

def get(db: Session, id: int) -> Optional[FrameworkVersion]:
    return db.query(FrameworkVersion).get(id)

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
