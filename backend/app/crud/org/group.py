from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.org.group import OrgGroup


# ---- OrgGroup CRUD ----
class OrgGroupCRUD:
    @staticmethod
    def list(db: Session) -> List[OrgGroup]:
        return db.query(OrgGroup).order_by(OrgGroup.name.asc()).all()

    @staticmethod
    def get(db: Session, group_id: int) -> OrgGroup:
        obj = db.query(OrgGroup).get(group_id)
        if not obj:
            raise HTTPException(404, "Group not found")
        return obj

    @staticmethod
    def create(db: Session, payload) -> OrgGroup:
        if db.query(OrgGroup).filter(OrgGroup.code == payload.code).first():
            raise HTTPException(409, "Group code already exists")
        obj = OrgGroup(**payload.dict())
        db.add(obj)
        db.commit()
        db.refresh(obj)
        return obj

    @staticmethod
    def update(db: Session, group_id: int, payload) -> OrgGroup:
        obj = OrgGroupCRUD.get(db, group_id)
        for k, v in payload.dict(exclude_unset=True).items():
            setattr(obj, k, v)
        db.add(obj)
        db.commit()
        db.refresh(obj)
        return obj

    @staticmethod
    def delete(db: Session, group_id: int) -> None:
        obj = OrgGroupCRUD.get(db, group_id)
        db.delete(obj)
        db.commit()

