from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import SessionLocal
from app.schemas.users.person import PersonCreate, PersonUpdate, PersonRead
from app.crud.users.person import get_person, get_all_persons, create_person, update_person, delete_person

router = APIRouter(prefix="/persons", tags=["Persons"])

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=List[PersonRead])
def read_persons(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return get_all_persons(db, skip=skip, limit=limit)

@router.get("/{person_id}", response_model=PersonRead)
def read_person(person_id: int, db: Session = Depends(get_db)):
    db_person = get_person(db, person_id)
    if not db_person:
        raise HTTPException(status_code=404, detail="Person not found")
    return db_person

@router.post("/", response_model=PersonRead)
def create_new_person(person: PersonCreate, db: Session = Depends(get_db)):
    return create_person(db, person)

@router.put("/{person_id}", response_model=PersonRead)
def update_existing_person(person_id: int, person: PersonUpdate, db: Session = Depends(get_db)):
    updated = update_person(db, person_id, person)
    if not updated:
        raise HTTPException(status_code=404, detail="Person not found")
    return updated

@router.delete("/{person_id}", response_model=dict)
def delete_existing_person(person_id: int, db: Session = Depends(get_db)):
    success = delete_person(db, person_id)
    if not success:
        raise HTTPException(status_code=404, detail="Person not found")
    return {"message": "Person deleted successfully"}

