from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import app.crud.risks.risk_category as crud
import app.schemas.risks.risk_category as schemas
from app.database import SessionLocal
router = APIRouter(prefix="/risk-categories", tags=["Risk Categories"])
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ------------------- Category Routes -------------------

@router.get("/", response_model=list[schemas.RiskScenarioCategory])
def list_categories(db: Session = Depends(get_db)):
    return crud.get_all_categories(db)

@router.get("/{category_id}", response_model=schemas.RiskScenarioCategory)
def get_category(category_id: int, db: Session = Depends(get_db)):
    category = crud.get_category(db, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category

@router.post("/", response_model=schemas.RiskScenarioCategory)
def create_category(data: schemas.RiskScenarioCategoryCreate, db: Session = Depends(get_db)):
    return crud.create_category(db, data)

@router.put("/{category_id}", response_model=schemas.RiskScenarioCategory)
def update_category(category_id: int, data: schemas.RiskScenarioCategoryUpdate, db: Session = Depends(get_db)):
    category = crud.update_category(db, category_id, data)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category

@router.delete("/{category_id}")
def delete_category(category_id: int, db: Session = Depends(get_db)):
    if not crud.delete_category(db, category_id):
        raise HTTPException(status_code=404, detail="Category not found")
    return {"detail": "Category deleted"}


# ------------------- Subcategory Routes -------------------

@router.get("/subcategories/", response_model=list[schemas.RiskScenarioSubcategory])
def list_subcategories(db: Session = Depends(get_db)):
    return crud.get_all_subcategories(db)

@router.get("/subcategories/{subcategory_id}", response_model=schemas.RiskScenarioSubcategory)
def get_subcategory(subcategory_id: int, db: Session = Depends(get_db)):
    subcategory = crud.get_subcategory(db, subcategory_id)
    if not subcategory:
        raise HTTPException(status_code=404, detail="Subcategory not found")
    return subcategory

@router.post("/subcategories/", response_model=schemas.RiskScenarioSubcategory)
def create_subcategory(data: schemas.RiskScenarioSubcategoryCreate, db: Session = Depends(get_db)):
    return crud.create_subcategory(db, data)

@router.put("/subcategories/{subcategory_id}", response_model=schemas.RiskScenarioSubcategory)
def update_subcategory(subcategory_id: int, data: schemas.RiskScenarioSubcategoryUpdate, db: Session = Depends(get_db)):
    subcategory = crud.update_subcategory(db, subcategory_id, data)
    if not subcategory:
        raise HTTPException(status_code=404, detail="Subcategory not found")
    return subcategory

@router.delete("/subcategories/{subcategory_id}")
def delete_subcategory(subcategory_id: int, db: Session = Depends(get_db)):
    if not crud.delete_subcategory(db, subcategory_id):
        raise HTTPException(status_code=404, detail="Subcategory not found")
    return {"detail": "Subcategory deleted"}
