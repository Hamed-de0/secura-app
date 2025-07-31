from sqlalchemy.orm import Session
from app.models.risks.risk_category import RiskScenarioCategory, RiskScenarioSubcategory
from app.schemas.risks.risk_category import (
    RiskScenarioCategoryCreate, RiskScenarioCategoryUpdate,
    RiskScenarioSubcategoryCreate, RiskScenarioSubcategoryUpdate
)

# ------------------- Category CRUD -------------------

def get_all_categories(db: Session):
    return db.query(RiskScenarioCategory).all()

def get_category(db: Session, category_id: int):
    return db.query(RiskScenarioCategory).filter(RiskScenarioCategory.id == category_id).first()

def create_category(db: Session, category_data: RiskScenarioCategoryCreate):
    category = RiskScenarioCategory(**category_data.dict())
    db.add(category)
    db.commit()
    db.refresh(category)
    return category

def update_category(db: Session, category_id: int, updates: RiskScenarioCategoryUpdate):
    category = get_category(db, category_id)
    if category:
        for key, value in updates.dict(exclude_unset=True).items():
            setattr(category, key, value)
        db.commit()
        db.refresh(category)
    return category

def delete_category(db: Session, category_id: int):
    category = get_category(db, category_id)
    if category:
        db.delete(category)
        db.commit()
    return category


# ------------------- Subcategory CRUD -------------------

def get_all_subcategories(db: Session):
    return db.query(RiskScenarioSubcategory).all()

def get_subcategory(db: Session, subcategory_id: int):
    return db.query(RiskScenarioSubcategory).filter(RiskScenarioSubcategory.id == subcategory_id).first()

def create_subcategory(db: Session, subcategory_data: RiskScenarioSubcategoryCreate):
    subcategory = RiskScenarioSubcategory(**subcategory_data.dict())
    db.add(subcategory)
    db.commit()
    db.refresh(subcategory)
    return subcategory

def update_subcategory(db: Session, subcategory_id: int, updates: RiskScenarioSubcategoryUpdate):
    subcategory = get_subcategory(db, subcategory_id)
    if subcategory:
        for key, value in updates.dict(exclude_unset=True).items():
            setattr(subcategory, key, value)
        db.commit()
        db.refresh(subcategory)
    return subcategory

def delete_subcategory(db: Session, subcategory_id: int):
    subcategory = get_subcategory(db, subcategory_id)
    if subcategory:
        db.delete(subcategory)
        db.commit()
    return subcategory
