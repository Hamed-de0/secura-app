from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.org.business_unit import OrgBusinessUnit


# ---- OrgBusinessUnit CRUD ----
class OrgBUCRUD:
    @staticmethod
    def list(db: Session, entity_id: Optional[int] = None) -> List[OrgBusinessUnit]:
        q = db.query(OrgBusinessUnit)
        if entity_id is not None:
            q = q.filter(OrgBusinessUnit.entity_id == entity_id)
        return q.order_by(OrgBusinessUnit.name.asc()).all()

    @staticmethod
    def get(db: Session, bu_id: int) -> OrgBusinessUnit:
        obj = db.query(OrgBusinessUnit).get(bu_id)
        if not obj:
            raise HTTPException(404, "Business Unit not found")
        return obj

    @staticmethod
    def create(db: Session, payload) -> OrgBusinessUnit:
        dupe = (
            db.query(OrgBusinessUnit)
            .filter(OrgBusinessUnit.entity_id == payload.entity_id, OrgBusinessUnit.code == payload.code)
            .first()
        )
        if dupe:
            raise HTTPException(409, "Business Unit code already exists for this entity")
        obj = OrgBusinessUnit(**payload.dict())
        db.add(obj)
        db.commit()
        db.refresh(obj)
        return obj

    @staticmethod
    def update(db: Session, bu_id: int, payload) -> OrgBusinessUnit:
        obj = OrgBUCRUD.get(db, bu_id)
        # enforce uniqueness if code changes
        data = payload.dict(exclude_unset=True)
        if "code" in data and data["code"] != obj.code:
            dupe = (
                db.query(OrgBusinessUnit)
                .filter(OrgBusinessUnit.entity_id == obj.entity_id, OrgBusinessUnit.code == data["code"])
                .first()
            )
            if dupe:
                raise HTTPException(409, "Business Unit code already exists for this entity")
        for k, v in data.items():
            setattr(obj, k, v)
        db.add(obj)
        db.commit()
        db.refresh(obj)
        return obj

    @staticmethod
    def delete(db: Session, bu_id: int) -> None:
        obj = OrgBUCRUD.get(db, bu_id)
        db.delete(obj)
        db.commit()

