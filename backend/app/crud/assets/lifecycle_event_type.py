from sqlalchemy.orm import Session
from app.models.assets.lifecycle_event_type import LifecycleEventType
from app.schemas.assets.lifecycle_event_type import LifecycleEventTypeCreate

def create(db: Session, data: LifecycleEventTypeCreate):
    db_item = LifecycleEventType(**data.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def get_all(db: Session):
    return db.query(LifecycleEventType).order_by(LifecycleEventType.name.asc()).all()
