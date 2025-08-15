from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.org.site import OrgSite

# ---- OrgSite CRUD ----
class OrgSiteCRUD:
    @staticmethod
    def list(db: Session, entity_id: Optional[int] = None) -> List[OrgSite]:
        q = db.query(OrgSite)
        if entity_id is not None:
            q = q.filter(OrgSite.entity_id == entity_id)
        return q.order_by(OrgSite.name.asc()).all()

    @staticmethod
    def get(db: Session, site_id: int) -> OrgSite:
        obj = db.query(OrgSite).get(site_id)
        if not obj:
            raise HTTPException(404, "Site not found")
        return obj

    @staticmethod
    def create(db: Session, payload) -> OrgSite:
        dupe = (
            db.query(OrgSite)
            .filter(OrgSite.entity_id == payload.entity_id, OrgSite.code == payload.code)
            .first()
        )
        if dupe:
            raise HTTPException(409, "Site code already exists for this entity")
        obj = OrgSite(**payload.dict())
        db.add(obj)
        db.commit()
        db.refresh(obj)
        return obj

    @staticmethod
    def update(db: Session, site_id: int, payload) -> OrgSite:
        obj = OrgSiteCRUD.get(db, site_id)
        data = payload.dict(exclude_unset=True)
        if "code" in data and data["code"] != obj.code:
            dupe = (
                db.query(OrgSite)
                .filter(OrgSite.entity_id == obj.entity_id, OrgSite.code == data["code"])
                .first()
            )
            if dupe:
                raise HTTPException(409, "Site code already exists for this entity")
        for k, v in data.items():
            setattr(obj, k, v)
        db.add(obj)
        db.commit()
        db.refresh(obj)
        return obj

    @staticmethod
    def delete(db: Session, site_id: int) -> None:
        obj = OrgSiteCRUD.get(db, site_id)
        db.delete(obj)
        db.commit()

