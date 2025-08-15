from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.org.service import OrgService


# ---- OrgService CRUD ----
class OrgServiceCRUD:
    @staticmethod
    def list(db: Session, provider_entity_id: Optional[int] = None) -> List[OrgService]:
        q = db.query(OrgService)
        if provider_entity_id is not None:
            q = q.filter(OrgService.provider_entity_id == provider_entity_id)
        return q.order_by(OrgService.name.asc()).all()

    @staticmethod
    def get(db: Session, service_id: int) -> OrgService:
        obj = db.query(OrgService).get(service_id)
        if not obj:
            raise HTTPException(404, "Service not found")
        return obj

    @staticmethod
    def create(db: Session, payload) -> OrgService:
        if db.query(OrgService).filter(OrgService.code == payload.code).first():
            raise HTTPException(409, "Service code already exists")
        obj = OrgService(**payload.dict())
        db.add(obj)
        db.commit()
        db.refresh(obj)
        return obj

    @staticmethod
    def update(db: Session, service_id: int, payload) -> OrgService:
        obj = OrgServiceCRUD.get(db, service_id)
        data = payload.dict(exclude_unset=True)
        if "code" in data and data["code"] != obj.code:
            if db.query(OrgService).filter(OrgService.code == data["code"]).first():
                raise HTTPException(409, "Service code already exists")
        for k, v in data.items():
            setattr(obj, k, v)
        db.add(obj)
        db.commit()
        db.refresh(obj)
        return obj

    @staticmethod
    def delete(db: Session, service_id: int) -> None:
        obj = OrgServiceCRUD.get(db, service_id)
        db.delete(obj)
        db.commit()
