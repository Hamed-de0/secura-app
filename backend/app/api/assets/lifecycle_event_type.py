from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.schemas.assets.lifecycle_event_type import LifecycleEventTypeRead, LifecycleEventTypeCreate
from app.crud.assets.lifecycle_event_type import create, get_all
from app.database import get_db

router = APIRouter(prefix="/lifecycle-event-types", tags=["Lifecycle Event Types"])

@router.post("/", response_model=LifecycleEventTypeRead)
def create_event_type(item: LifecycleEventTypeCreate, db: Session = Depends(get_db)):
    return create(db, item)

@router.get("/", response_model=List[LifecycleEventTypeRead])
def list_event_types(db: Session = Depends(get_db)):
    return get_all(db)

@router.post("/bunch/")
def create_many(db: Session = Depends(get_db)):
    created = []
    data = [
        {"name": "Acquired", "description": "Asset was purchased, hired, developed or created"},
        {"name": "Registered", "description": "Asset was formally registered or inventoried"},
        {"name": "Assigned", "description": "Asset was assigned to a department, person, or system"},
        {"name": "In Use", "description": "Asset is actively used in operations"},
        {"name": "Maintained", "description": "Maintenance was performed on asset (hardware/software/personnel)"},
        {"name": "Reassigned", "description": "Ownership or usage responsibility changed"},
        {"name": "Access Granted", "description": "User or role received access to the asset"},
        {"name": "Access Revoked", "description": "Access to the asset was revoked or limited"},
        {"name": "Backed Up", "description": "Backup operation performed (applies to data/assets)"},
        {"name": "Restored", "description": "Asset or data was restored from backup"},
        {"name": "Security Incident", "description": "Asset involved in a security incident or breach"},
        {"name": "Audit Performed", "description": "Asset was reviewed or audited"},
        {"name": "Retired", "description": "Asset no longer in use, but not yet destroyed"},
        {"name": "Destroyed", "description": "Asset was securely deleted, destroyed or disposed of"},
        {"name": "Removed", "description": "Asset removed from the asset inventory"}
    ]
    for item in data:
        payload = LifecycleEventTypeCreate(**item)
        created.append(create(db, payload))
    return created
