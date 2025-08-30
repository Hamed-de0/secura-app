from fastapi import APIRouter, Depends, Query, status, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db
from app.schemas.compliance.framework_activation import ActiveFrameworksResponse, FrameworkActivationPolicyCreate, FrameworkActivationPolicyRead
from app.services.compliance.framework_activation import get_active_frameworks_for_scope
from app.models.policies.framework_activation_policy import FrameworkActivationPolicy
from app.api.deps.scope import resolve_scope


router = APIRouter(prefix="/policies/framework-activation", tags=["Compliance Policies"])

@router.get("/active-for-scope", response_model=ActiveFrameworksResponse)
def active_frameworks_for_scope(
    scope: tuple[str,int] = Depends(resolve_scope),
    # scope_type: str = Query(..., description="Scope type (e.g., org, asset_group, asset_type, tag, asset)"),
    # scope_id: int = Query(..., description="Scope id"),
    db: Session = Depends(get_db),
):
    """
    Lists framework versions activated by policy for the given EXACT scope, ordered by priority.
    """
    scope_type, scope_id = scope
    return get_active_frameworks_for_scope(db=db, scope_type=scope_type, scope_id=scope_id)


@router.post("/", response_model=FrameworkActivationPolicyRead, status_code=status.HTTP_201_CREATED)
def create_framework_activation_policy(
    payload: FrameworkActivationPolicyCreate,
    db: Session = Depends(get_db),
):
    obj = FrameworkActivationPolicy(
        framework_version_id=payload.framework_version_id,
        scope_type=payload.scope_type,
        scope_id=payload.scope_id,
        priority=payload.priority,
        is_enabled=payload.is_enabled,
        start_date=payload.start_date or datetime.utcnow(),
        end_date=payload.end_date,
        notes=payload.notes,
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

@router.put("/{policy_id}", response_model=FrameworkActivationPolicyRead)
def update_framework_activation_policy(
    policy_id: int,
    payload: FrameworkActivationPolicyCreate,  # full replace semantics
    db: Session = Depends(get_db),
):
    obj = db.query(FrameworkActivationPolicy).get(policy_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Activation policy not found")

    # Full replace of fields
    # TODO
    obj.framework_version_id = payload.framework_version_id
    obj.scope_type = payload.scope_type
    obj.scope_id = payload.scope_id
    obj.priority = payload.priority
    obj.is_enabled = payload.is_enabled
    obj.start_date = payload.start_date or obj.start_date or datetime.utcnow()
    obj.end_date = payload.end_date
    obj.notes = payload.notes

    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.delete("/{policy_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_framework_activation_policy(
    policy_id: int,
    db: Session = Depends(get_db),
):
    obj = db.query(FrameworkActivationPolicy).get(policy_id)
    if not obj:
        # 204 on idempotent delete is fine, but many APIs return 404. Pick one:
        raise HTTPException(status_code=404, detail="Activation policy not found")
    db.delete(obj)
    db.commit()
    return None