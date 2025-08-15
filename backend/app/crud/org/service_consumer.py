from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.org.service_consumer import OrgServiceConsumer


# ---- OrgServiceConsumer CRUD ----
class OrgServiceConsumerCRUD:
    @staticmethod
    def list(db: Session, service_id: Optional[int] = None, consumer_entity_id: Optional[int] = None, consumer_bu_id: Optional[int] = None) -> List[OrgServiceConsumer]:
        q = db.query(OrgServiceConsumer)
        if service_id is not None:
            q = q.filter(OrgServiceConsumer.service_id == service_id)
        if consumer_entity_id is not None:
            q = q.filter(OrgServiceConsumer.consumer_entity_id == consumer_entity_id)
        if consumer_bu_id is not None:
            q = q.filter(OrgServiceConsumer.consumer_bu_id == consumer_bu_id)
        return q.order_by(OrgServiceConsumer.id.asc()).all()

    @staticmethod
    def get(db: Session, link_id: int) -> OrgServiceConsumer:
        obj = db.query(OrgServiceConsumer).get(link_id)
        if not obj:
            raise HTTPException(404, "Service consumer link not found")
        return obj

    @staticmethod
    def create(db: Session, payload) -> OrgServiceConsumer:
        dupe = (
            db.query(OrgServiceConsumer)
            .filter(
                OrgServiceConsumer.service_id == payload.service_id,
                OrgServiceConsumer.consumer_entity_id == payload.consumer_entity_id,
                OrgServiceConsumer.consumer_bu_id == payload.consumer_bu_id,
            ).first()
        )
        if dupe:
            raise HTTPException(409, "Consumer already linked to this service")
        obj = OrgServiceConsumer(**payload.dict())
        db.add(obj)
        db.commit()
        db.refresh(obj)
        return obj

    @staticmethod
    def update(db: Session, link_id: int, payload) -> OrgServiceConsumer:
        obj = OrgServiceConsumerCRUD.get(db, link_id)
        for k, v in payload.dict(exclude_unset=True).items():
            setattr(obj, k, v)
        db.add(obj)
        db.commit()
        db.refresh(obj)
        return obj

    @staticmethod
    def delete(db: Session, link_id: int) -> None:
        obj = OrgServiceConsumerCRUD.get(db, link_id)
        db.delete(obj)
        db.commit()

