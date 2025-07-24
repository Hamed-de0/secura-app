from sqlalchemy.orm import Session
from app.models.risks.impact_domain import ImpactDomain
from app.schemas.risks import ImpactDomainCreate
from typing import List, Optional

def create_impact_domain(db: Session, domain_in: ImpactDomainCreate) -> ImpactDomain:
    domain = ImpactDomain(**domain_in.dict())
    db.add(domain)
    db.commit()
    db.refresh(domain)
    return domain

def get_impact_domain(db: Session, domain_id: int) -> Optional[ImpactDomain]:
    return db.query(ImpactDomain).filter(ImpactDomain.id == domain_id).first()

def get_impact_domains(db: Session, skip: int = 0, limit: int = 100) -> List[ImpactDomain]:
    return db.query(ImpactDomain).offset(skip).limit(limit).all()

def delete_impact_domain(db: Session, domain: ImpactDomain) -> None:
    db.delete(domain)
    db.commit()
