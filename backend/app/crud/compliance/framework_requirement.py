from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.compliance.framework_requirement import FrameworkRequirement
from app.schemas.compliance.framework_requirement import FrameworkRequirementCreate, FrameworkRequirementUpdate

def _would_create_cycle(db: Session, node_id: int, new_parent_id: Optional[int]) -> bool:
    if not new_parent_id or node_id == new_parent_id:
        return node_id == new_parent_id
    current = db.query(FrameworkRequirement).get(new_parent_id)
    while current:
        if current.id == node_id:
            return True
        if not current.parent_id:
            break
        current = db.query(FrameworkRequirement).get(current.parent_id)
    return False

def list_by_version(db: Session, framework_version_id: int) -> List[FrameworkRequirement]:
    return (
        db.query(FrameworkRequirement)
        .filter(FrameworkRequirement.framework_version_id == framework_version_id)
        .order_by(FrameworkRequirement.parent_id.asc(), FrameworkRequirement.sort_index.asc(), FrameworkRequirement.id.asc())
        .all()
    )

def create(db: Session, payload: FrameworkRequirementCreate) -> FrameworkRequirement:
    data = payload.model_dump()
    if data.get("parent_id"):
        parent = db.query(FrameworkRequirement).get(data["parent_id"])
        if not parent or parent.framework_version_id != data["framework_version_id"]:
            raise ValueError("parent_id must reference a requirement in the same framework version")

    obj = FrameworkRequirement(**data)
    db.add(obj); db.flush()

    if _would_create_cycle(db, obj.id, obj.parent_id):
        db.rollback(); raise ValueError("Invalid parent_id: cycle detected")

    db.commit(); db.refresh(obj)
    return obj

def update(db: Session, req_id: int, payload: FrameworkRequirementUpdate) -> Optional[FrameworkRequirement]:
    obj = db.query(FrameworkRequirement).get(req_id)
    if not obj: return None

    data = payload.model_dump(exclude_unset=True)
    new_parent_id = data.get("parent_id", obj.parent_id)
    if new_parent_id != obj.parent_id:
        if new_parent_id:
            parent = db.query(FrameworkRequirement).get(new_parent_id)
            if not parent or parent.framework_version_id != obj.framework_version_id:
                raise ValueError("parent_id must reference a requirement in the same framework version")
        if _would_create_cycle(db, obj.id, new_parent_id):
            raise ValueError("Invalid parent_id: cycle detected")
        obj.parent_id = new_parent_id

    for f in ("code","title","text"):
        if f in data: setattr(obj, f, data[f])
    if "sort_index" in data and data["sort_index"] is not None:
        obj.sort_index = int(data["sort_index"])

    db.commit(); db.refresh(obj)
    return obj

def delete(db: Session, req_id: int) -> bool:
    obj = db.query(FrameworkRequirement).get(req_id)
    if not obj: return False
    db.delete(obj); db.commit()
    return True
