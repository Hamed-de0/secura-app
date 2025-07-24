from sqlalchemy.orm import Session
from app.models.users.person import Person
from app.schemas.users.person import PersonCreate, PersonUpdate

def get_person(db: Session, person_id: int) -> Person:
    return db.query(Person).filter(Person.id == person_id).first()

def get_all_persons(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Person).offset(skip).limit(limit).all()

def create_person(db: Session, person: PersonCreate) -> Person:
    db_person = Person(**person.model_dump())
    db.add(db_person)
    db.commit()
    db.refresh(db_person)
    return db_person

def update_person(db: Session, person_id: int, person_data: PersonUpdate) -> Person:
    db_person = get_person(db, person_id)
    if not db_person:
        return None
    for key, value in person_data.model_dump(exclude_unset=True).items():
        setattr(db_person, key, value)
    db.commit()
    db.refresh(db_person)
    return db_person

def delete_person(db: Session, person_id: int) -> bool:
    db_person = get_person(db, person_id)
    if not db_person:
        return False
    db.delete(db_person)
    db.commit()
    return True