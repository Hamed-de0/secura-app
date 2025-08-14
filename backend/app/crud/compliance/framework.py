from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.compliance.framework import Framework
from app.schemas.compliance.framework import FrameworkCreate, FrameworkUpdate

def create(db: Session, data: FrameworkCreate) -> Framework:
    row = Framework(**data.model_dump()); db.add(row); db.commit(); db.refresh(row); return row
def update(db: Session, id: int, data: FrameworkUpdate) -> Optional[Framework]:
    row = db.query(Framework).get(id);
    if not row: return None
    for k,v in data.model_dump(exclude_unset=True).items(): setattr(row,k,v)
    db.commit(); db.refresh(row); return row
def delete(db: Session, id: int) -> bool:
    row = db.query(Framework).get(id);
    if not row: return False
    db.delete(row); db.commit(); return True
def list(db: Session) -> List[Framework]:
    return db.query(Framework).order_by(Framework.name.asc()).all()
