from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
import csv, io, json
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.compliance.control_framework_mapping import (
    ControlFrameworkMappingCreate,
    ControlFrameworkMappingUpdate,
    ControlFrameworkMappingOut,
)
from app.schemas.compliance.framework_requirement import FrameworkRequirementOut
from app.crud.compliance import control_framework_mapping as crud
from app.models.compliance import *
from app.models.controls.control import Control

router = APIRouter(prefix="/crosswalks", tags=["Compliance - Crosswalks"])


def _resolve_requirement(db: Session, f_code: str, f_ver: str, r_code: str) -> int:
    q = (
        db.query(FrameworkRequirement.id)
        .join(FrameworkVersion, FrameworkVersion.id == FrameworkRequirement.framework_version_id)
        .join(Framework, Framework.id == FrameworkVersion.framework_id)
        .filter(Framework.code == f_code, FrameworkVersion.version_label == f_ver, FrameworkRequirement.code == r_code)
    )
    rid = q.scalar()
    if not rid:
        raise HTTPException(400, detail=f"Requirement not found: {f_code}/{f_ver}/{r_code}")
    return rid


def _resolve_control(db: Session, control_ref: str) -> int:
    cid = db.query(Control.id).filter(Control.reference_code == control_ref).scalar()
    if not cid:
        raise HTTPException(400, detail=f"Control not found: {control_ref}")
    return cid


def _resolve_or_create_atom(db: Session, requirement_id: int, atom_key: str, upsert_atoms: bool) -> int:
    atom = (
        db.query(ObligationAtom)
        .filter(ObligationAtom.framework_requirement_id == requirement_id, ObligationAtom.atom_key == atom_key)
        .first()
    )
    if atom:
        return atom.id
    if not upsert_atoms:
        raise HTTPException(400, detail=f"Obligation atom not found for requirement={requirement_id} atom_key={atom_key}")
    # create minimal atom placeholder
    atom = ObligationAtom(
        framework_requirement_id=requirement_id,
        atom_key=atom_key,
        obligation_text=atom_key,
    )
    db.add(atom)
    db.flush()  # get ID without full commit yet
    return atom.id


@router.post("", response_model=ControlFrameworkMappingOut)
def create(payload: ControlFrameworkMappingCreate, db: Session = Depends(get_db)):
    return crud.create(db, payload)

@router.put("/{id}", response_model=ControlFrameworkMappingOut)
def update(id: int, payload: ControlFrameworkMappingUpdate, db: Session = Depends(get_db)):
    row = crud.update(db, id, payload)
    if not row:
        raise HTTPException(404, "Not found")
    return row

@router.delete("/{id}")
def delete(id: int, db: Session = Depends(get_db)):
    ok = crud.delete(db, id)
    if not ok:
        raise HTTPException(404, "Not found")
    return {"deleted": ok}

@router.get("/requirements/{framework_requirement_id}", response_model=List[ControlFrameworkMappingOut])
def list_by_requirement(framework_requirement_id: int, db: Session = Depends(get_db)):
    return crud.list_by_requirement(db, framework_requirement_id)

@router.get("/controls/{control_id}", response_model=List[FrameworkRequirementOut])
def list_requirements_for_control(control_id: int, db: Session = Depends(get_db)):
    return crud.list_requirements_by_control(db, control_id)


@router.post("/bulk")
async def import_crosswalks(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    upsert_atoms: bool = False,
):
    """
    CSV headers (required + optional):
      framework_code,framework_version,requirement_code,control_ref,weight,notes,
      atom_key,relation_type,coverage_level,applicability,evidence_hint,rationale

    - If atom_key is present, mapping is created at the obligation level.
    - applicability: JSON string (e.g., {"xborder":false})
    - evidence_hint: JSON array of strings (e.g., ["IR runbook","Receipt"]) or semicolon list
    """
    data = io.StringIO((await file.read()).decode("utf-8"))
    reader = csv.DictReader(data)

    created, updated = 0, 0
    for row in reader:
        f_code = row["framework_code"].strip()
        f_ver = row["framework_version"].strip()
        r_code = row["requirement_code"].strip()
        c_ref = row["control_ref"].strip()

        weight = int(row.get("weight") or 100)
        notes = (row.get("notes") or "").strip()

        atom_key = (row.get("atom_key") or "").strip() or None
        relation_type = (row.get("relation_type") or None)
        coverage_level = (row.get("coverage_level") or None)

        applicability = row.get("applicability")
        evidence_hint = row.get("evidence_hint")
        rationale = (row.get("rationale") or None)

        # parse JSON-ish columns
        def _parse_json(value):
            if value is None or value == "":
                return None
            try:
                return json.loads(value)
            except Exception:
                return None

        applicability = _parse_json(applicability)
        if evidence_hint:
            eh = _parse_json(evidence_hint)
            if eh is None:
                # allow semicolon-separated fallback
                eh = [p.strip() for p in evidence_hint.split(";") if p.strip()]
            evidence_hint = eh

        req_id = _resolve_requirement(db, f_code, f_ver, r_code)
        ctl_id = _resolve_control(db, c_ref)

        atom_id = None
        if atom_key:
            atom_id = _resolve_or_create_atom(db, req_id, atom_key, upsert_atoms)

        # UPSERT semantics
        q = db.query(ControlFrameworkMapping)
        if atom_id is None:
            q = q.filter(
                ControlFrameworkMapping.framework_requirement_id == req_id,
                ControlFrameworkMapping.control_id == ctl_id,
                ControlFrameworkMapping.obligation_atom_id.is_(None),
            )
        else:
            q = q.filter(
                ControlFrameworkMapping.obligation_atom_id == atom_id,
                ControlFrameworkMapping.control_id == ctl_id,
            )

        obj = q.one_or_none()
        if obj:
            obj.weight = weight
            obj.notes = notes
            obj.relation_type = relation_type
            obj.coverage_level = coverage_level
            obj.applicability = applicability
            obj.evidence_hint = evidence_hint
            obj.rationale = rationale
            updated += 1
        else:
            obj = ControlFrameworkMapping(
                framework_requirement_id=req_id,
                control_id=ctl_id,
                obligation_atom_id=atom_id,
                weight=weight,
                notes=notes,
                relation_type=relation_type,
                coverage_level=coverage_level,
                applicability=applicability,
                evidence_hint=evidence_hint,
                rationale=rationale,
            )
            db.add(obj)
            created += 1

    db.commit()
    return {"created": created, "updated": updated}

