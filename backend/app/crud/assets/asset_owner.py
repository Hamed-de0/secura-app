
from sqlalchemy.orm import Session, joinedload
from app.models.assets import AssetOwner
from app.schemas.assets import AssetOwnerCreate
from typing import List, Optional

def create_asset_owner(db: Session, obj: AssetOwnerCreate) -> AssetOwner:
    db_obj = AssetOwner(**obj.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def get_asset_owners_name(
    db: Session,
    asset_id: Optional[int] = None,
    person_id: Optional[int] = None,
    skip: int = 0, limit: int = 100
) -> List[dict]:
    query = db.query(AssetOwner).options(joinedload(AssetOwner.person))

    if asset_id:
        query = query.filter(AssetOwner.asset_id == asset_id)
    if person_id:
        query = query.filter(AssetOwner.person_id == person_id)

    asset_owners = query.offset(skip).limit(limit).all()

    # Include full name of person in the result
    result = []
    for ao in asset_owners:
        result.append({
            "id": ao.id,
            "asset_id": ao.asset_id,
            "person_id": ao.person_id,
            "role": ao.role,
            "valid_from": ao.valid_from,
            "valid_to": ao.valid_to,
            "description": ao.description,
            "person_full_name": f"{ao.person.first_name} {ao.person.last_name}" if ao.person else None
        })
    return result


def get_asset_owner(db: Session, owner_id: int) -> Optional[AssetOwner]:
    return db.query(AssetOwner).filter(AssetOwner.id == owner_id).first()

def get_asset_owners(db: Session, skip: int = 0, limit: int = 100) -> List[AssetOwner]:
    return db.query(AssetOwner).offset(skip).limit(limit).all()

def update_asset_owner(db: Session, owner_id: int, obj: AssetOwnerCreate) -> Optional[AssetOwner]:
    db_obj = db.query(AssetOwner).filter(AssetOwner.id == owner_id).first()
    if not db_obj:
        return None
    for key, value in obj.dict().items():
        setattr(db_obj, key, value)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete_asset_owner(db: Session, owner_id: int) -> bool:
    db_obj = db.query(AssetOwner).filter(AssetOwner.id == owner_id).first()
    if not db_obj:
        return False
    db.delete(db_obj)
    db.commit()
    return True
