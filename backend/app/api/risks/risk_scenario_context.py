from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any, List

from app.database import get_db
from app.schemas.risks.risk_scenario_context import (
    RiskScenarioContext as RiskScenarioContextOut,
    RiskScenarioContextCreate,
    RiskScenarioContextUpdate,
    RiskContextBatchAssignInput,
    BatchAssignIn,
    PrefillRequest, PrefillResponseItem
)
from app.schemas.risks.risk_context_list import RiskContextListResponse
from app.schemas.risks.risk_context_details import RiskContextDetails
from app.services import calculate_risk_scores_by_context
from app.crud.risks import risk_scenario_context as crud_legacy, risk_context_list, context_metrics
from app.crud.risks.risk_scenario_context import RiskScenarioContextCRUD as rsc_crud
from app.constants.scopes import normalize_scope, is_valid_scope, SCOPE_TYPES

router = APIRouter(prefix="/risk_scenario_contexts", tags=["Risk Contexts"])


# -------------------------------------------------------------
# Helpers
# -------------------------------------------------------------

def _infer_scope_from_legacy(
    asset_id: Optional[int] = None,
    asset_group_id: Optional[int] = None,
    asset_tag_id: Optional[int] = None,
    asset_type_id: Optional[int] = None,
) -> Optional[tuple[str, int]]:
    """Map legacy query to normalized scope tuple if provided.
    Returns (scope_type, scope_id) or None if no legacy hints are present.
    Order of precedence matches old DB check: asset > group > tag > type.
    """
    if asset_id is not None:
        return ("asset", asset_id)
    if asset_group_id is not None:
        return ("asset_group", asset_group_id)
    if asset_tag_id is not None:
        return ("tag", asset_tag_id)
    if asset_type_id is not None:
        return ("asset_type", asset_type_id)
    return None


# -------------------------------------------------------------
# CRUD – normalized scope
# -------------------------------------------------------------
@router.post("/", response_model=RiskScenarioContextOut)
def create_context(payload: RiskScenarioContextCreate, db: Session = Depends(get_db)):
    """Create a risk scenario context using normalized scope (scope_type + scope_id).
    Legacy asset* fields in the payload are accepted and auto-inferred by the schema.
    """
    return rsc_crud.create(db, payload)


@router.get("/", response_model=List[RiskScenarioContextOut])
def list_contexts(
    risk_scenario_id: Optional[int] = Query(None, description="Filter by scenario id"),
    scope_type: Optional[str] = Query(None, description=f"One of: {', '.join(SCOPE_TYPES)}"),
    scope_id: Optional[int] = Query(None, description="Scope id"),
    # Legacy convenience filters (kept for migration period)
    asset_id: Optional[int] = Query(None),
    asset_group_id: Optional[int] = Query(None),
    asset_tag_id: Optional[int] = Query(None),
    asset_type_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    # If normalized scope is provided, normalize it; otherwise infer from legacy
    if scope_type is not None:
        if not is_valid_scope(scope_type):
            raise HTTPException(400, detail=f"Unsupported scope_type '{scope_type}'")
        scope_type = normalize_scope(scope_type)
        if scope_id is None:
            raise HTTPException(400, detail="When scope_type is provided, scope_id is required")
    else:
        legacy = _infer_scope_from_legacy(asset_id, asset_group_id, asset_tag_id, asset_type_id)
        if legacy:
            scope_type, scope_id = legacy

    return rsc_crud.list(db, risk_scenario_id, scope_type, scope_id)

@router.get("/metrics")
@router.get("/metrics/")
def get_risk_context_metrics(
    scope: str = Query("all"),                           # asset|asset_type|asset_group|tag|bu|site|entity|service|org_group|all
    scope_id: int = Query(None),
    status: str = Query("all"),
    domain: str = Query("all"),                          # C|I|A|L|R|all
    over_appetite: Optional[bool] = Query(None),
    owner_id: Optional[int] = Query(None),
    days: int = Query(90, ge=1, le=365),
    search: str = Query("", max_length=200),
    db: Session = Depends(get_db),
):
    return context_metrics(
        db, scope_id=scope_id, scope=scope, status=status, domain=domain,
        over_appetite=over_appetite, owner_id=owner_id, days=days, search=search
    )

# -------------------------------------------------------------
# Paginated/managed list – keep existing integration
# -------------------------------------------------------------
@router.get("/contexts", response_model=RiskContextListResponse)
@router.get("/contexts/", response_model=RiskContextListResponse)
def get_contexts(
    offset: int = Query(0, ge=0),
    limit: int = Query(25, ge=1, le=200),
    sort_by: str = Query("updated_at"),
    sort_dir: str = Query("desc"),
    scope: str = Query("all"),
    status: str = Query("all"),
    search: str = Query("", max_length=200),
    domain: str = "all",  # C|I|A|L|R|all
    over_appetite: Optional[bool] = None,
    owner_id: Optional[int] = None,
    days: int = 90,
    db: Session = Depends(get_db),
):
    return risk_context_list.list_contexts(
        db,
        offset=offset,
        limit=limit,
        sort_by=sort_by,
        sort_dir=sort_dir,
        scope=scope,
        status=status,
        search=search,
        domain=domain,
        owner_id=owner_id,
        over_appetite=over_appetite,
        days=days
    )


@router.get("/{context_id}/details", response_model=RiskContextDetails)
@router.get("/{context_id}/details/", response_model=RiskContextDetails)
def get_risk_context_details(
    context_id: int,
    days: int = Query(90, ge=1, le=365),   # evidence freshness window & trend length
    db: Session = Depends(get_db),
):
    return risk_context_list.get_context_by_details(db=db, context_id=context_id, days=days)


@router.get("/{context_id}", response_model=RiskScenarioContextOut)
@router.get("/{context_id}/", response_model=RiskScenarioContextOut)
def get_context(context_id: int, db: Session = Depends(get_db)):
    return rsc_crud.get(db, context_id)


@router.put("/{context_id}", response_model=RiskScenarioContextOut)
@router.put("/{context_id}/", response_model=RiskScenarioContextOut)
def update_context(context_id: int, payload: RiskScenarioContextUpdate, db: Session = Depends(get_db)):
    return rsc_crud.update(db, context_id, payload)


@router.delete("/{context_id}", status_code=204)
@router.delete("/{context_id}/", status_code=204)
def delete_context(context_id: int, db: Session = Depends(get_db)):
    rsc_crud.delete(db, context_id)
    return None


# -------------------------------------------------------------
# Risk score view (pure read)
# -------------------------------------------------------------
@router.get("/risk-score/{context_id}", response_model=Dict[str, Any])
def get_risk_score(context_id: int, db: Session = Depends(get_db)):
    return calculate_risk_scores_by_context(db, context_id=context_id)


# -------------------------------------------------------------
# Batch assign – legacy function kept (works with normalized schema too)
# -------------------------------------------------------------
@router.post("/batch-assign")
def batch_assign(body: BatchAssignIn, db: Session = Depends(get_db)):
    return crud_legacy.batch_assign(db, body)
# def batch_assign_contexts(data: RiskContextBatchAssignInput, db: Session = Depends(get_db)):
#     return crud_legacy.batch_assign_contexts(data, db)

@router.post("/prefill/", response_model=List[PrefillResponseItem])
def prefill(body: PrefillRequest, db: Session = Depends(get_db)):
    pairs = [(p.scenarioId, normalize_scope(p.scopeRef.type), p.scopeRef.id) for p in body.pairs]
    return crud_legacy.prefill_contexts(db, pairs)

# -------------------------------------------------------------
# Expanded manage view – keep as-is, but now accepts scope_type
# -------------------------------------------------------------
@router.get("/expanded/manage")
def get_expanded_contexts(
    db: Session = Depends(get_db),
    page: int = 1,
    page_size: int = 10,
    search: Optional[str] = None,
    scope_type: Optional[str] = None,
    status: Optional[str] = None,
):
    # Normalize scope_type if provided; this endpoint delegates to legacy crud which may ignore it
    if scope_type is not None:
        if not is_valid_scope(scope_type):
            raise HTTPException(400, detail=f"Unsupported scope_type '{scope_type}'")
        scope_type = normalize_scope(scope_type)

    return crud_legacy.get_expanded_contexts(
        db=db,
        page=page,
        page_size=page_size,
        search=search,
        scope_type=scope_type,
        status=status,
    )
