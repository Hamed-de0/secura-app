from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.schemas.risks.context_bulk import BulkCreateRequest, BulkCreateResponse
from app.schemas.risks.risk_scenario_context import BatchAssignIn, ImpactRatingIn
from app.constants.scopes import normalize_scope
from app.crud.risks.risk_scenario_context import batch_assign


router = APIRouter(prefix="/risk_scenario_contexts", tags=["Risk Contexts"])


@router.post("/bulk_create/", response_model=BulkCreateResponse)
def bulk_create(body: BulkCreateRequest, db: Session = Depends(get_db)):
    created: List[int] = []
    updated: List[int] = []
    skipped: List[dict] = []

    for item in body.items:
        st = normalize_scope(item.scopeRef.type)
        # Map impacts dict to ImpactRatingIn list
        impact_list: List[ImpactRatingIn] = []
        if item.impacts:
            for k in ["C", "I", "A", "L", "R"]:
                if k in item.impacts and item.impacts[k] is not None:
                    impact_list.append(ImpactRatingIn(domain=k, score=int(item.impacts[k])))

        req = BatchAssignIn(
            risk_scenario_id=item.scenarioId,
            scope_type=st,
            target_ids=[int(item.scopeRef.id)],
            likelihood=item.likelihood,
            impact_ratings=impact_list,
            owner_id=item.ownerId,
            next_review=item.nextReview,
            on_conflict="skip",
        )
        res = batch_assign(db, req)
        created.extend(res.get("createdIds", []))
        updated.extend(res.get("updated", []))
        for sk in res.get("skipped", []):
            skipped.append(sk)

    return BulkCreateResponse(createdIds=created, skipped=skipped, updated=updated)

