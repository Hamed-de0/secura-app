from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.risks.risk_scenario_context import RiskScenarioContext
from app.schemas.risks.risk_scenario_context import (
    RiskScenarioContextCreate, RiskScenarioContextUpdate,
    RiskContextBatchAssignInput)
from app.models.risks.risk_context_impact_rating import RiskContextImpactRating
from typing import Optional, List
from app.models.risks.risk_scenario_context import RiskScenarioContext as RSCModel
from datetime import datetime


# legacy
def create_context(db: Session, obj_in: RiskScenarioContextCreate) -> RiskScenarioContext:
    obj = RiskScenarioContext(**obj_in.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

def get_context(db: Session, context_id: int) -> RiskScenarioContext:
    return db.query(RiskScenarioContext).filter(RiskScenarioContext.id == context_id).first()

def get_all_contexts(db: Session, skip: int = 0, limit: int = 100):
    return db.query(RiskScenarioContext).offset(skip).limit(limit).all()

def update_context(db: Session, context_id: int, obj_in: RiskScenarioContextUpdate) -> RiskScenarioContext:
    db_obj = get_context(db, context_id)
    data = obj_in.model_dump(exclude_unset=True)

    print('----------------------------------', data)
    for field, value in data.dict(exclude_unset=True).items():
        setattr(db_obj, field, value)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete_context(db: Session, context_id: int):
    db_obj = get_context(db, context_id)
    db.delete(db_obj)
    db.commit()

def get_expanded_contexts(db: Session, page: int, page_size: int, search: Optional[str], scope_type: Optional[str], status: Optional[str]):
    from sqlalchemy.orm import joinedload
    from sqlalchemy import or_, func
    from app.models import RiskScenarioContext, RiskScenario, Asset, AssetGroup, AssetTag
    from app.models.risks import RiskContextImpactRating, ImpactDomain

    query = db.query(RiskScenarioContext)\
        .options(
            joinedload(RiskScenarioContext.risk_scenario),
            joinedload(RiskScenarioContext.impact_ratings).joinedload(RiskContextImpactRating.domain),
            joinedload(RiskScenarioContext.asset),
            joinedload(RiskScenarioContext.asset_group),
            joinedload(RiskScenarioContext.asset_tag),
            joinedload(RiskScenarioContext.asset_type),
    )

    if scope_type in ("asset", "group", "tag", "type"):
        if scope_type == "asset":
            query = query.filter(RiskScenarioContext.asset_id.isnot(None))
        elif scope_type == "group":
            query = query.filter(RiskScenarioContext.asset_group_id.isnot(None))
        elif scope_type == "tag":
            query = query.filter(RiskScenarioContext.asset_tag_id.isnot(None))
        elif scope_type == "type":
            query = query.filter(RiskScenarioContext.asset_type_id.isnot(None))

    if status:
        query = query.filter(RiskScenarioContext.status.ilike(status))

    if search:
        query = query.join(RiskScenario)\
                     .filter(or_(
                         RiskScenario.title_en.ilike(f"%{search}%"),
                         RiskScenario.title_de.ilike(f"%{search}%")
                     ))

    total = query.count()
    contexts = query.offset((page - 1) * page_size).limit(page_size).all()

    result = []
    for ctx in contexts:
        scope_type = "Asset" if ctx.asset_id else "Group" if ctx.asset_group_id else "Tag" if ctx.asset_tag_id else "Type"
        scope_name = (
            ctx.asset.name if ctx.asset_id else
            ctx.asset_group.name if ctx.asset_group_id else
            ctx.asset_tag.name if ctx.asset_tag_id else
            ctx.asset_type.name if ctx.asset_type_id else
            "Unknown"
        )

        impacts = {
            rating.domain.name.lower(): rating.score
            for rating in ctx.impact_ratings
        }

        result.append({
            "id": ctx.id,
            "risk_scenario_id": ctx.risk_scenario_id,
            "scenario_title": ctx.risk_scenario.title_en,
            "scope_type": scope_type,
            "scope_name": scope_name,
            "status": ctx.status,
            "likelihood": ctx.likelihood,
            "impacts": impacts
        })

    return {"total": total, "items": result}

def batch_assign_contexts(data: RiskContextBatchAssignInput, db: Session):
    created_contexts = []

    for target_id in data.target_ids:
        context_kwargs = {
            "risk_scenario_id": data.risk_scenario_id,
            "likelihood": data.likelihood,
            "status": data.status,
            "lifecycle_states": data.lifecycle_states,
        }



        # Dynamically assign target based on scope type
        if data.scope_type == "asset":
            context_kwargs["asset_id"] = target_id
        elif data.scope_type == "group":
            context_kwargs["asset_group_id"] = target_id
        elif data.scope_type == "tag":
            context_kwargs["asset_tag_id"] = target_id
        elif data.scope_type == "type":
            context_kwargs["asset_type_id"] = target_id

        context = RiskScenarioContext(**context_kwargs)
        db.add(context)
        db.flush()  # Ensures context.id is available

        for rating in data.impact_ratings:
            impact = RiskContextImpactRating(
                risk_scenario_context_id=context.id,
                domain_id=rating.domain_id,
                score=rating.score
            )
            db.add(impact)

        created_contexts.append(context)

    db.commit()
    return {"assigned": len(created_contexts)}


class RiskScenarioContextCRUD:
    @staticmethod
    def get(db: Session, context_id: int) -> RSCModel:
        obj = db.query(RSCModel).get(context_id)
        if not obj:
            raise HTTPException(404, "Risk scenario context not found")
        return obj

    @staticmethod
    def list(
        db: Session,
        risk_scenario_id: Optional[int] = None,
        scope_type: Optional[str] = None,
        scope_id: Optional[int] = None,
    ) -> List[RSCModel]:
        q = db.query(RSCModel)
        if risk_scenario_id is not None:
            q = q.filter(RSCModel.risk_scenario_id == risk_scenario_id)
        if scope_type is not None:
            q = q.filter(RSCModel.scope_type == scope_type)
        if scope_id is not None:
            q = q.filter(RSCModel.scope_id == scope_id)
        return q.order_by(RSCModel.id.asc()).all()

    @staticmethod
    def create(db: Session, payload) -> RSCModel:
        # Uniqueness guard: (risk_scenario_id, scope_type, scope_id)
        dupe = (
            db.query(RSCModel)
            .filter(
                RSCModel.risk_scenario_id == payload.risk_scenario_id,
                RSCModel.scope_type == payload.scope_type,
                RSCModel.scope_id == payload.scope_id,
            )
            .first()
        )
        if dupe:
            raise HTTPException(409, "Context already exists for this scenario and scope")

        obj = RSCModel(**payload.dict(exclude_unset=True))
        db.add(obj)
        db.commit()
        db.refresh(obj)
        return obj

    @staticmethod
    def update(db: Session, context_id: int, payload) -> RSCModel:
        obj = RiskScenarioContextCRUD.get(db, context_id)

        if 'scope_type' in payload and payload['scope_type'] is None:
            del payload['scope_type']


        data = payload.dict(exclude_unset=True)

        # If scope fields change, re-check uniqueness
        if any(k in data for k in ("risk_scenario_id", "scope_type", "scope_id")):
            rs = data.get("risk_scenario_id", obj.risk_scenario_id)
            st = data.get("scope_type", obj.scope_type)
            sid = data.get("scope_id", obj.scope_id)
            dupe = (
                db.query(RSCModel)
                .filter(
                    RSCModel.id != obj.id,
                    RSCModel.risk_scenario_id == rs,
                    RSCModel.scope_type == st,
                    RSCModel.scope_id == sid,
                )
                .first()
            )
            if dupe:
                raise HTTPException(409, "Another context already exists for this scenario and scope")

        for k, v in data.items():
            if k != "scope_type":
                setattr(obj, k, v)
        # db.add(obj)
        obj.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(obj)
        return obj

    @staticmethod
    def delete(db: Session, context_id: int) -> None:
        obj = RiskScenarioContextCRUD.get(db, context_id)
        db.delete(obj)
        db.commit()


