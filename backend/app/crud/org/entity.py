from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.org.entity import OrgEntity

# ---- OrgEntity CRUD ----
class OrgEntityCRUD:
    @staticmethod
    def list(db: Session, group_id: Optional[int] = None) -> List[OrgEntity]:
        q = db.query(OrgEntity)
        if group_id is not None:
            q = q.filter(OrgEntity.group_id == group_id)
        return q.order_by(OrgEntity.name.asc()).all()

    @staticmethod
    def get(db: Session, entity_id: int) -> OrgEntity:
        obj = db.query(OrgEntity).get(entity_id)
        if not obj:
            raise HTTPException(404, "Entity not found")
        return obj

    @staticmethod
    def create(db: Session, payload) -> OrgEntity:
        if db.query(OrgEntity).filter(OrgEntity.code == payload.code).first():
            raise HTTPException(409, "Entity code already exists")
        obj = OrgEntity(**payload.dict())
        db.add(obj)
        db.commit()
        db.refresh(obj)
        return obj

    @staticmethod
    def update(db: Session, entity_id: int, payload) -> OrgEntity:
        obj = OrgEntityCRUD.get(db, entity_id)
        for k, v in payload.dict(exclude_unset=True).items():
            setattr(obj, k, v)
        db.add(obj)
        db.commit()
        db.refresh(obj)
        return obj

    @staticmethod
    def delete(db: Session, entity_id: int) -> None:
        obj = OrgEntityCRUD.get(db, entity_id)
        db.delete(obj)
        db.commit()

