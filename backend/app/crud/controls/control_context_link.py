from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.models.controls.control_context_link import ControlContextLink
from app.schemas.controls.control_context_link import ControlContextLinkCreate, ControlContextLinkUpdate, ControlContextStatusUpdate
from fastapi import HTTPException

from app.models.controls.control_context_link import ControlContextLink as CCLModel
from app.models.risks.risk_scenario_context import RiskScenarioContext as RSCModel


def upsert(db: Session, data: ControlContextLinkCreate) -> ControlContextLink:
    row = db.query(ControlContextLink).filter_by(
        risk_scenario_context_id=data.risk_scenario_context_id,
        control_id=data.control_id
    ).first()
    if row is None:
        row = ControlContextLink(**data.dict())
        db.add(row)
    else:
        for k, v in data.dict().items():
            setattr(row, k, v)
    db.commit(); db.refresh(row)
    return row

def update(db: Session, id: int, data: ControlContextLinkUpdate) -> Optional[ControlContextLink]:
    row = db.query(ControlContextLink).get(id)
    if not row: return None
    for k, v in data.dict(exclude_unset=True).items():
        setattr(row, k, v)
    db.commit(); db.refresh(row)
    return row

def delete(db: Session, id: int) -> bool:
    row = db.query(ControlContextLink).get(id)
    if not row: return False
    db.delete(row); db.commit()
    return True

def list_by_context(db: Session, context_id: int) -> List[ControlContextLink]:
    return db.query(ControlContextLink).filter_by(risk_scenario_context_id=context_id).all()

def update_status(db: Session, link_id: int, payload: ControlContextStatusUpdate) -> Optional[ControlContextLink]:
    obj = db.query(ControlContextLink).get(link_id)
    if not obj:
        return None
    data = payload.model_dump(exclude_unset=True)
    if "assurance_status" in data:
        obj.assurance_status = data["assurance_status"]
        obj.status_updated_at = datetime.utcnow()
    if "implemented_at" in data:
        obj.implemented_at = data["implemented_at"]
    if "notes" in data:
        obj.notes = data["notes"]
    db.commit()
    db.refresh(obj)
    return obj


class ControlContextLinkCRUD:
    @staticmethod
    def get(db: Session, link_id: int) -> CCLModel:
        obj = db.query(CCLModel).get(link_id)
        if not obj:
            raise HTTPException(404, "Control link not found")
        return obj

    @staticmethod
    def list(
        db: Session,
        risk_scenario_context_id: Optional[int] = None,
        scope_type: Optional[str] = None,
        scope_id: Optional[int] = None,
        control_id: Optional[int] = None,
    ) -> List[CCLModel]:
        q = db.query(CCLModel)
        if risk_scenario_context_id is not None:
            q = q.filter(CCLModel.risk_scenario_context_id == risk_scenario_context_id)
        if scope_type is not None:
            q = q.filter(CCLModel.scope_type == scope_type)
        if scope_id is not None:
            q = q.filter(CCLModel.scope_id == scope_id)
        if control_id is not None:
            q = q.filter(CCLModel.control_id == control_id)
        return q.order_by(CCLModel.id.asc()).all()

    @staticmethod
    def _validate_target(db: Session, rsc_id: Optional[int], scope_type: Optional[str], scope_id: Optional[int]):
        if rsc_id is None and not (scope_type and scope_id):
            raise HTTPException(400, "Provide either risk_scenario_context_id or (scope_type & scope_id)")
        if rsc_id is not None:
            # ensure RSC exists
            if not db.query(RSCModel.id).filter(RSCModel.id == rsc_id).scalar():
                raise HTTPException(400, "risk_scenario_context_id not found")

    @staticmethod
    def _find_dupe(db: Session, *, rsc_id, scope_type, scope_id, control_id, exclude_id: Optional[int] = None) -> Optional[CCLModel]:
        q = db.query(CCLModel).filter(CCLModel.control_id == control_id)
        if rsc_id is not None:
            q = q.filter(CCLModel.risk_scenario_context_id == rsc_id)
        else:
            q = q.filter(
                CCLModel.risk_scenario_context_id.is_(None),
                CCLModel.scope_type == scope_type,
                CCLModel.scope_id == scope_id,
            )
        if exclude_id is not None:
            q = q.filter(CCLModel.id != exclude_id)
        return q.first()

    @staticmethod
    def create(db: Session, payload) -> CCLModel:
        data = payload.dict(exclude_unset=True, by_alias=True)
        rsc_id = data.get("risk_scenario_context_id")
        scope_type = data.get("scope_type")
        scope_id = data.get("scope_id")
        control_id = data["control_id"]

        ControlContextLinkCRUD._validate_target(db, rsc_id, scope_type, scope_id)
        dupe = ControlContextLinkCRUD._find_dupe(db, rsc_id=rsc_id, scope_type=scope_type, scope_id=scope_id, control_id=control_id)
        if dupe:
            raise HTTPException(409, "Control already linked to this target")

        obj = CCLModel(**data)
        db.add(obj)
        db.commit()
        db.refresh(obj)
        return obj

    @staticmethod
    def update(db: Session, link_id: int, payload) -> CCLModel:
        obj = ControlContextLinkCRUD.get(db, link_id)
        data = payload.dict(exclude_unset=True, by_alias=True)

        rsc_id = data.get("risk_scenario_context_id", obj.risk_scenario_context_id)
        scope_type = data.get("scope_type", obj.scope_type)
        scope_id = data.get("scope_id", obj.scope_id)
        control_id = data.get("control_id", obj.control_id)

        ControlContextLinkCRUD._validate_target(db, rsc_id, scope_type, scope_id)
        dupe = ControlContextLinkCRUD._find_dupe(
            db,
            rsc_id=rsc_id,
            scope_type=scope_type,
            scope_id=scope_id,
            control_id=control_id,
            exclude_id=obj.id,
        )
        if dupe:
            raise HTTPException(409, "Another link already exists for this target and control")

        for k, v in data.items():
            setattr(obj, k, v)
        db.add(obj)
        db.commit()
        db.refresh(obj)
        return obj

    @staticmethod
    def delete(db: Session, link_id: int) -> None:
        obj = ControlContextLinkCRUD.get(db, link_id)
        db.delete(obj)
        db.commit()

