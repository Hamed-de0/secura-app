from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.crud.risks import (
    create_impact_domain,
    get_impact_domain,
    get_impact_domains,
    delete_impact_domain
)
from app.schemas.risks import ImpactDomainCreate, ImpactDomainRead
from app.models.risks import ImpactDomain

router = APIRouter(prefix="/impact-domains", tags=["Impact Domains"])

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=ImpactDomainRead)
def create(domain_in: ImpactDomainCreate, db: Session = Depends(get_db)):
    return create_impact_domain(db, domain_in)

@router.get("/", response_model=list[ImpactDomainRead])
def read_all(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return get_impact_domains(db, skip, limit)

@router.get("/{domain_id}", response_model=ImpactDomainRead)
def read(domain_id: int, db: Session = Depends(get_db)):
    domain = get_impact_domain(db, domain_id)
    if not domain:
        raise HTTPException(status_code=404, detail="Impact Domain not found")
    return domain

@router.delete("/{domain_id}")
def delete(domain_id: int, db: Session = Depends(get_db)):
    domain = get_impact_domain(db, domain_id)
    if not domain:
        raise HTTPException(status_code=404, detail="Impact Domain not found")
    delete_impact_domain(db, domain)
    return {"detail": "Deleted"}
