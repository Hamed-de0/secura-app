from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.compliance.framework_requirement import FrameworkRequirement
from app.models.compliance.control_framework_mapping import ControlFrameworkMapping
from app.schemas.compliance.coverage import FrameworkCoverageSummary, RequirementCoverageItem

def compute_version_mapping_coverage(db: Session, framework_version_id: int) -> FrameworkCoverageSummary:
    total_requirements = (
        db.query(func.count(FrameworkRequirement.id))
        .filter(FrameworkRequirement.framework_version_id == framework_version_id)
        .scalar()
    ) or 0

    rows = (
        db.query(
            FrameworkRequirement.id.label("req_id"),
            FrameworkRequirement.code,
            FrameworkRequirement.title,
            func.count(ControlFrameworkMapping.id).label("cnt"),
            func.array_agg(ControlFrameworkMapping.control_id).label("control_ids"),
        )
        .outerjoin(ControlFrameworkMapping, ControlFrameworkMapping.framework_requirement_id == FrameworkRequirement.id)
        .filter(FrameworkRequirement.framework_version_id == framework_version_id)
        .group_by(FrameworkRequirement.id)
        .order_by(FrameworkRequirement.parent_id.asc(), FrameworkRequirement.sort_index.asc(), FrameworkRequirement.id.asc())
        .all()
    )

    details = []
    mapped_requirements = 0
    for r in rows:
        cnt = int(r.cnt or 0)
        if cnt > 0:
            mapped_requirements += 1
        details.append(RequirementCoverageItem(
            requirement_id=r.req_id,
            code=r.code,
            title=r.title,
            mapped_controls_count=cnt,
            control_ids=[c for c in (r.control_ids or []) if c is not None],
        ))

    pct = round(mapped_requirements * 100.0 / total_requirements, 1) if total_requirements else 0.0
    return FrameworkCoverageSummary(
        framework_id=framework_version_id,  # (or rename field)
        total_requirements=total_requirements,
        mapped_requirements=mapped_requirements,
        percent_mapped=pct,
        details=details,
    )
