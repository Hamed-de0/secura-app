import csv
from io import StringIO
from typing import List, Dict, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.models.compliance.framework_requirement import FrameworkRequirement
from app.models.controls.control import Control
from app.models.compliance.control_framework_mapping import ControlFrameworkMapping

class CrosswalkImportReport:
    def __init__(self):
        self.total_rows = 0
        self.created = 0
        self.updated = 0
        self.skipped = 0
        self.errors: List[str] = []

    def dict(self):
        return {
            "total_rows": self.total_rows,
            "created": self.created,
            "updated": self.updated,
            "skipped": self.skipped,
            "errors": self.errors,
        }

def _parse_csv(text: str) -> List[Dict[str, str]]:
    reader = csv.DictReader(StringIO(text))
    required = {"framework_requirement_code", "control_code"}
    if not reader.fieldnames:
        raise ValueError("CSV has no header")
    cols = {c.strip() for c in reader.fieldnames}
    missing = required - cols
    if missing:
        raise ValueError(f"CSV missing required columns: {', '.join(sorted(missing))}")
    rows: List[Dict[str, str]] = []
    for raw in reader:
        rows.append({
            "framework_requirement_code": (raw.get("framework_requirement_code") or "").strip(),
            "control_code": (raw.get("control_code") or "").strip(),
            "weight": (raw.get("weight") or "").strip(),
            "notes": (raw.get("notes") or "").strip(),
        })
    return rows

def _resolve_requirement_ids(db: Session, framework_version_id: int) -> Dict[str, int]:
    # Build a map: requirement_code -> id (scoped to version)
    out: Dict[str, int] = {}
    q = db.query(FrameworkRequirement).filter(
        FrameworkRequirement.framework_version_id == framework_version_id
    )
    for r in q.all():
        if r.code:
            out[str(r.code).strip()] = r.id
    return out

def _resolve_control_ids(db: Session) -> Dict[str, int]:
    # Build a map: control_code -> id (assumes codes unique)
    out: Dict[str, int] = {}
    for c in db.query(Control).all():
        if c.reference_code:
            out[str(c.reference_code).strip()] = c.id
    return out

def import_crosswalks_csv(
    db: Session,
    framework_version_id: int,
    csv_text: str,
    dry_run: bool = False,
    upsert: bool = True,
    default_weight: int = 100,
) -> CrosswalkImportReport:
    rep = CrosswalkImportReport()
    rows = _parse_csv(csv_text)
    rep.total_rows = len(rows)
    if not rows:
        return rep

    # Build lookup caches
    req_code_to_id = _resolve_requirement_ids(db, framework_version_id)
    ctl_code_to_id = _resolve_control_ids(db)

    for i, r in enumerate(rows, start=2):  # start=2 to account for header=1 when reporting line numbers
        req_code = r["framework_requirement_code"]
        ctl_code = r["control_code"]
        if not req_code or not ctl_code:
            rep.skipped += 1
            rep.errors.append(f"Line {i}: missing framework_requirement_code or control_code")
            continue

        req_id = req_code_to_id.get(req_code)
        if not req_id:
            rep.skipped += 1
            rep.errors.append(f"Line {i}: requirement code '{req_code}' not found in version {framework_version_id}")
            continue

        ctl_id = ctl_code_to_id.get(ctl_code)
        if not ctl_id:
            rep.skipped += 1
            rep.errors.append(f"Line {i}: control code '{ctl_code}' not found")
            continue

        # parse weight
        try:
            weight = int(r["weight"]) if r["weight"] else default_weight
        except ValueError:
            weight = default_weight

        notes = r["notes"] or None

        # Upsert
        existing = (
            db.query(ControlFrameworkMapping)
            .filter(
                ControlFrameworkMapping.framework_requirement_id == req_id,
                ControlFrameworkMapping.control_id == ctl_id,
            ).first()
        )

        if existing:
            if upsert:
                changed = False
                if existing.weight != weight:
                    existing.weight = weight; changed = True
                if (existing.notes or None) != notes:
                    existing.notes = notes; changed = True
                if changed and not dry_run:
                    db.flush()
                rep.updated += 1 if changed else 0
            else:
                rep.skipped += 1
            continue

        # Create new
        if not dry_run:
            obj = ControlFrameworkMapping(
                framework_requirement_id=req_id,
                control_id=ctl_id,
                weight=weight,
                notes=notes,
            )
            db.add(obj)
        rep.created += 1

    if not dry_run:
        db.commit()
    return rep
