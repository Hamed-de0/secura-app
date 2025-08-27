from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_, tuple_, func
from sqlalchemy.dialects.postgresql import insert as pg_insert
from app.models.risks.risk_scenario_context import RiskScenarioContext
from app.models.risks.risk_scenario import RiskScenario
from app.schemas.risks.risk_scenario_context import (
    RiskScenarioContextCreate, RiskScenarioContextUpdate,
    RiskContextBatchAssignInput, BatchAssignIn)
from app.models.risks.risk_context_impact_rating import RiskContextImpactRating
from typing import Optional, List, Tuple, Dict, Any
from app.models.risks.risk_scenario_context import RiskScenarioContext as RSCModel
from app.models.common.idempotency_key import IdempotencyKey
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

def _set_impacts(db: Session, context_id: int, impact_items):
    # replace ratings for the 5 domains in one go
    db.query(RiskContextImpactRating)\
      .filter(RiskContextImpactRating.risk_scenario_context_id == context_id)\
      .delete(synchronize_session=False)
    rows = []
    # impact_items has .domain (C/I/A/L/R) and .score
    by_dom = {it.domain: int(it.score or 0) for it in impact_items}
    for dom in ("C","I","A","L","R"):
        rows.append(RiskContextImpactRating(
            risk_scenario_context_id=context_id,
            domain=dom,
            score=by_dom.get(dom, 0),
        ))
    db.bulk_save_objects(rows)


def _hash_payload(s: str) -> str:
    import hashlib
    return hashlib.sha256(s.encode("utf-8")).hexdigest()

def normalize_scope(s: str) -> str:
    return s.lower().strip()

def find_existing_pairs(
    db: Session, pairs: List[Tuple[int, str, int]]
) -> Dict[Tuple[int,str,int], int]:
    """Return {(scenario_id, scope_type, scope_id): context_id} for existing ones."""
    if not pairs:
        return {}
    rows = (
        db.query(RiskScenarioContext.risk_scenario_id,
                 RiskScenarioContext.scope_type,
                 RiskScenarioContext.scope_id,
                 RiskScenarioContext.id)
          .filter(tuple_(RiskScenarioContext.risk_scenario_id,
                         RiskScenarioContext.scope_type,
                         RiskScenarioContext.scope_id).in_(pairs))
          .all()
    )
    return {(sid, st, sid2): cid for (sid, st, sid2, cid) in rows}

def _defaults_for_scenario(db: Session, scenario_id: int) -> Tuple[int, Dict[str, int]]:
    """
    Return default (likelihood, impacts) for a scenario.
    - risk_scenarios.likelihood: int (fallback 1)
    - risk_scenarios.impact:
        * if dict-like: {C,I,A,L,R} (case-insensitive) → coerce 0..5
        * if scalar: treated as "overall" → put into R (0..5)
        * if None/invalid: all zeros
    """
    def _coerce_0_5(v: Any) -> int:
        try:
            return max(0, min(5, int(float(v))))
        except Exception:
            return 0

    imp: Dict[str, int] = {"C": 0, "I": 0, "A": 0, "L": 0, "R": 0}

    sn: RiskScenario | None = db.query(RiskScenario).get(scenario_id)
    if not sn:
        return 1, imp  # no scenario → safe fallback

    # Likelihood: only override if not null
    like = _coerce_0_5(getattr(sn, "likelihood", None)) if getattr(sn, "likelihood", None) is not None else 1

    raw_imp = getattr(sn, "impact", None)

    if raw_imp is None:
        # keep all zeros
        return like, imp

    # If impact is a dict-like JSON (preferred): fill known domains
    if isinstance(raw_imp, dict):
        for k in ("C", "I", "A", "L", "R"):
            # accept keys in any case; also accept long names if you ever store them
            v = (
                raw_imp.get(k)
                or raw_imp.get(k.lower())
                or raw_imp.get(k.upper())
                or raw_imp.get({"C":"confidentiality","I":"integrity","A":"availability","L":"legal","R":"overall"}.get(k), None)
            )
            if v is not None:
                imp[k] = _coerce_0_5(v)
        return like, imp

    # If impact is a single scalar: treat as overall → put in R
    imp["R"] = _coerce_0_5(raw_imp)
    return like, imp

def prefill_contexts(
    db: Session, pairs: List[Tuple[int, str, int]]
):
    ex = find_existing_pairs(db, pairs)
    out = []
    for (scenario_id, st, sid) in pairs:
        if (scenario_id, st, sid) in ex:
            # load existing values
            ctx = db.query(RiskScenarioContext).get(ex[(scenario_id, st, sid)])
            like = int(getattr(ctx, "likelihood", 0) or 0)
            # pack impacts from related table
            ratings = {r.domain: int(r.score or 0) for r in getattr(ctx, "impact_ratings", [])}
            imp = {k: ratings.get(k, 0) for k in ("C","I","A","L","R")}
            out.append({
                "scenarioId": scenario_id,
                "scopeRef": {"type": st, "id": sid},
                "exists": True,
                "likelihood": like,
                "impacts": imp,
                "rationale": [],
                "suggestedReviewDate": getattr(ctx, "next_review", None)
            })
        else:
            like, imp = _defaults_for_scenario(db, scenario_id)
            out.append({
                "scenarioId": scenario_id,
                "scopeRef": {"type": st, "id": sid},
                "exists": False,
                "likelihood": like,
                "impacts": imp,
                "rationale": [],
                "suggestedReviewDate": None
            })
    return out



def batch_assign(db: Session, body: BatchAssignIn):
    now = datetime.utcnow()
    st = body.scope_type.lower()
    ids = sorted(set(body.target_ids))

    # --- Idempotency short-circuit (optional but recommended)
    if body.idempotency_key:
        row = db.query(IdempotencyKey).get(body.idempotency_key)
        if row and row.response_json:
            import json
            return json.loads(row.response_json)

    # --- Find existing contexts for (scenario_id, scope_type, scope_id)
    pairs = [(body.risk_scenario_id, st, sid) for sid in ids]
    existing_rows = (
        db.query(RiskScenarioContext.risk_scenario_id,
                 RiskScenarioContext.scope_type,
                 RiskScenarioContext.scope_id,
                 RiskScenarioContext.id)
        .filter(tuple_(RiskScenarioContext.risk_scenario_id,
                       RiskScenarioContext.scope_type,
                       RiskScenarioContext.scope_id).in_(pairs))
        .all()
    )
    existing = {(sid, s_type, s_id): ctx_id for sid, s_type, s_id, ctx_id in existing_rows}

    created_ids = []
    updated_ids = []
    skipped = []

    # --- INSERT missing (bulk)
    to_insert = []
    for scope_id in ids:
        key = (body.risk_scenario_id, st, scope_id)
        if key in existing:
            continue
        to_insert.append({
            "risk_scenario_id": body.risk_scenario_id,
            "scope_type": st,
            "scope_id": scope_id,
            "likelihood": int(body.likelihood or 0) if body.likelihood is not None else None,
            "status": body.status or "Open",
            "lifecycle_states": body.lifecycle_states or None,
            "owner_id": body.owner_id,
            "next_review": body.next_review,
            "created_at": now,
            "updated_at": now,
        })

    if to_insert:
        stmt = pg_insert(RiskScenarioContext).values(to_insert) \
            .on_conflict_do_nothing(index_elements=["risk_scenario_id", "scope_type", "scope_id"]) \
            .returning(RiskScenarioContext.id,
                       RiskScenarioContext.risk_scenario_id,
                       RiskScenarioContext.scope_type,
                       RiskScenarioContext.scope_id)
        rows = db.execute(stmt).fetchall()
        db.flush()
        for ctx_id, sid, s_type, s_id in rows:
            created_ids.append(ctx_id)
            existing[(sid, s_type, s_id)] = ctx_id  # so impacts can be set below

    # --- UPDATE existing if requested
    if body.on_conflict == "update":
        # pull all target ctx ids (both newly created and previously existing)
        target_ctx_ids = [existing[(body.risk_scenario_id, st, sid)] for sid in ids if
                          (body.risk_scenario_id, st, sid) in existing]
        if target_ctx_ids:
            q = db.query(RiskScenarioContext).filter(RiskScenarioContext.id.in_(target_ctx_ids))
            updates = {}
            if body.likelihood is not None: updates["likelihood"] = int(body.likelihood)
            if body.status is not None: updates["status"] = body.status
            if body.lifecycle_states is not None: updates["lifecycle_states"] = body.lifecycle_states
            if body.owner_id is not None: updates["owner_id"] = body.owner_id
            if body.next_review is not None: updates["next_review"] = body.next_review
            if updates:
                updates["updated_at"] = now
                q.update(updates, synchronize_session=False)
                # mark updated: exclude those we just created
                updated_ids = [cid for cid in target_ctx_ids if cid not in created_ids]

    # --- Set impacts for contexts that were newly created or updated
    impact_items = body.impact_ratings or []
    if impact_items:
        target_ctx_ids = created_ids if body.on_conflict == "skip" else \
            [existing[(body.risk_scenario_id, st, sid)] for sid in ids if (body.risk_scenario_id, st, sid) in existing]
        for ctx_id in target_ctx_ids:
            _set_impacts(db, ctx_id, impact_items)

    db.commit()

    # --- Skipped list (only for skip mode)
    if body.on_conflict == "skip":
        for scope_id in ids:
            key = (body.risk_scenario_id, st, scope_id)
            if key in existing and existing[key] not in created_ids:
                skipped.append({"scenarioId": body.risk_scenario_id, "scopeRef": {"type": st, "id": scope_id}})

    resp = {
        "createdIds": created_ids,
        "skipped": skipped,
        "updated": updated_ids,  # [] when on_conflict="skip"
    }

    # Store idempotent response
    if body.idempotency_key:
        import json, hashlib
        payload_hash = hashlib.sha256(
            json.dumps(dict(body), default=str, sort_keys=True).encode("utf-8")
        ).hexdigest()
        row = db.query(IdempotencyKey).get(body.idempotency_key)
        if row:
            row.request_hash = payload_hash
            row.response_json = json.dumps(resp, default=str)
        else:
            row = IdempotencyKey(
                key=body.idempotency_key,
                request_hash=payload_hash,
                response_json=json.dumps(resp, default=str),
            )
            db.add(row)
        db.commit()

    return resp


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




