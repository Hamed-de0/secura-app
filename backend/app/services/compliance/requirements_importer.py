import csv
from io import StringIO
from typing import List, Dict, Optional
from sqlalchemy.orm import Session

from app.models.compliance.framework_requirement import FrameworkRequirement
from app.schemas.compliance.imports import ImportResult

class RowIn:
    def __init__(self, ext_id: str, parent_ext_id: Optional[str], title: Optional[str],
                 text: Optional[str], code: Optional[str], sort_index: Optional[int]):
        self.ext_id = (ext_id or "").strip()
        self.parent_ext_id = (parent_ext_id or "").strip() or None
        self.title = (title or "").strip() or None
        self.text = (text or "").strip() or None
        self.code = (code or "").strip() or None
        self.sort_index = int(sort_index) if (str(sort_index or "").strip().isdigit()) else 0

def parse_csv_text_idbased(text: str) -> List[RowIn]:
    reader = csv.DictReader(StringIO(text))
    required = {"ext_id"}
    missing = required - set([c.strip() for c in (reader.fieldnames or [])])
    if missing:
        raise ValueError(f"CSV missing required columns: {', '.join(sorted(missing))}")

    rows: List[RowIn] = []
    for raw in reader:
        rows.append(RowIn(
            ext_id=raw.get("ext_id"),
            parent_ext_id=raw.get("parent_ext_id"),
            title=raw.get("title"),
            text=raw.get("text"),
            code=raw.get("code"),
            sort_index=raw.get("sort_index"),
        ))
    return rows

def import_requirements_csv_idbased(
    db: Session,
    framework_version_id: int,
    csv_text: str,
    dry_run: bool = False,
) -> ImportResult:
    rows = parse_csv_text_idbased(csv_text)
    if not rows:
        # NOTE: If your ImportResult still uses 'framework_id' field name, keep it and pass version id into it.
        return ImportResult(
            framework_version_id=framework_version_id,  # or framework_id=framework_version_id
            total_rows=0, created=0, updated=0, linked_parents=0, dry_run=dry_run, skipped=0, errors=[]
        )

    created = updated = linked = skipped = 0
    errors: List[str] = []

    # Pass 1: insert or update rows (without parents)
    ext_to_id: Dict[str, int] = {}
    staged: List[FrameworkRequirement] = []

    for r in rows:
        if not r.ext_id:
            skipped += 1
            continue

        obj: Optional[FrameworkRequirement] = None
        if r.code:
            obj = (
                db.query(FrameworkRequirement)
                .filter(
                    FrameworkRequirement.framework_version_id == framework_version_id,
                    FrameworkRequirement.code == r.code
                )
                .first()
            )

        if obj:
            changed = False
            if r.title is not None and r.title != (obj.title or None):
                obj.title = r.title; changed = True
            if r.text is not None and r.text != (obj.text or None):
                obj.text = r.text; changed = True
            if r.code is not None and r.code != (obj.code or None):
                obj.code = r.code; changed = True
            if obj.sort_index != r.sort_index:
                obj.sort_index = r.sort_index; changed = True
            if changed:
                updated += 1
        else:
            obj = FrameworkRequirement(
                framework_version_id=framework_version_id,
                code=r.code,
                title=r.title,
                text=r.text,
                sort_index=r.sort_index,
            )
            db.add(obj)
            created += 1

        staged.append(obj)

    if not dry_run:
        db.flush()  # assign IDs

    # Build ext_id → db id map (for new and updated)
    for r, obj in zip(rows, staged):
        if obj and getattr(obj, "id", None):
            ext_to_id[r.ext_id] = obj.id

    # Pass 2: resolve parents by parent_ext_id
    for r, obj in zip(rows, staged):
        if not obj:
            continue
        if r.parent_ext_id:
            parent_id = ext_to_id.get(r.parent_ext_id)
            if not parent_id:
                errors.append(f"Missing parent_ext_id '{r.parent_ext_id}' for ext_id '{r.ext_id}'")
                continue
            if not dry_run and obj.parent_id != parent_id:
                if obj.id == parent_id:
                    errors.append(f"Cycle self-parent for ext_id '{r.ext_id}'")
                    continue
                obj.parent_id = parent_id
                linked += 1

    if not dry_run:
        db.commit()

    return ImportResult(
        framework_version_id=framework_version_id,  # or framework_id=framework_version_id if your schema hasn't been renamed yet
        total_rows=len(rows),
        created=created,
        updated=updated,
        linked_parents=linked,
        dry_run=dry_run,
        skipped=skipped,
        errors=errors,
    )
