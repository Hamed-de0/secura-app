from __future__ import annotations
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.compliance.requirement_owner import RequirementOwnerRead, RequirementOwnerCreate
from app.crud.compliance import requirement_owner as crud

router = APIRouter(prefix="/compliance", tags=["compliance:owners"])

@router.get(
    "/requirement/{requirement_id}/owners",
    response_model=List[RequirementOwnerRead],
    summary="List owners/reviewers for a requirement (optionally per scope)"
)
def list_requirement_owners(
    requirement_id: int,
    scope_type: Optional[str] = Query(None),
    scope_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    rows = crud.list_by_requirement(db, requirement_id=requirement_id, scope_type=scope_type, scope_id=scope_id)
    return rows

@router.post(
    "/requirement/{requirement_id}/owners",
    response_model=RequirementOwnerRead,
    status_code=status.HTTP_201_CREATED,
    summary="Assign owner/reviewer to requirement in a scope"
)
def create_requirement_owner(
    requirement_id: int,
    body: RequirementOwnerCreate,
    db: Session = Depends(get_db),
):
    obj = crud.create(db, requirement_id=requirement_id, data=body)
    return obj

@router.delete(
    "/requirement/owners/{owner_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Remove an owner/reviewer"
)
def delete_requirement_owner(
    owner_id: int,
    db: Session = Depends(get_db),
):
    deleted = crud.delete_owner(db, owner_id=owner_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Owner not found")
