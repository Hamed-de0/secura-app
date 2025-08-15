# =============================================
# app/crud/compliance/obligation_atom.py
# =============================================
from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.compliance.obligation_atom import ObligationAtom
from app.schemas.compliance.obligation_atom import (
    ObligationAtomCreate, ObligationAtomUpdate
)


def list_by_requirement(db: Session, requirement_id: int) -> List[ObligationAtom]:
    return (
        db.query(ObligationAtom)
        .filter(ObligationAtom.framework_requirement_id == requirement_id)
        .order_by(ObligationAtom.sort_index.asc(), ObligationAtom.id.asc())
        .all()
    )


def get(db: Session, atom_id: int) -> ObligationAtom:
    obj = db.query(ObligationAtom).get(atom_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Obligation atom not found")
    return obj


def create(db: Session, data: ObligationAtomCreate) -> ObligationAtom:
    # ensure unique (framework_requirement_id, atom_key)
    exists = (
        db.query(ObligationAtom)
        .filter(
            ObligationAtom.framework_requirement_id == data.framework_requirement_id,
            ObligationAtom.atom_key == data.atom_key,
        )
        .first()
    )
    if exists:
        raise HTTPException(status_code=409, detail="atom_key already exists for this requirement")

    obj = ObligationAtom(**data.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def update(db: Session, atom_id: int, data: ObligationAtomUpdate) -> ObligationAtom:
    obj = get(db, atom_id)

    payload = data.dict(exclude_unset=True)

    # if atom_key is changing, enforce uniqueness
    if "atom_key" in payload and payload["atom_key"] != obj.atom_key:
        dupe = (
            db.query(ObligationAtom)
            .filter(
                ObligationAtom.framework_requirement_id == obj.framework_requirement_id,
                ObligationAtom.atom_key == payload["atom_key"],
            )
            .first()
        )
        if dupe:
            raise HTTPException(status_code=409, detail="atom_key already exists for this requirement")

    for k, v in payload.items():
        setattr(obj, k, v)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def delete(db: Session, atom_id: int) -> None:
    obj = get(db, atom_id)
    db.delete(obj)
    db.commit()

