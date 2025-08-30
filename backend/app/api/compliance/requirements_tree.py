from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.compliance.requirements_tree import RequirementTreeNode
from app.services.compliance.requirements_tree import get_requirements_tree
from typing import List

router = APIRouter(prefix="/compliance/requirements", tags=["Compliance Requirements"])

@router.get("/tree", response_model=List[RequirementTreeNode])
def get_tree(version_id: int = Query(...), db: Session = Depends(get_db)):
    return get_requirements_tree(db, version_id)
