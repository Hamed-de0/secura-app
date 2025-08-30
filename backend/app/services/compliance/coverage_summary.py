from datetime import datetime
from sqlalchemy.orm import Session

from app.schemas.compliance.coverage_summary import CoverageSummary
from app.services.compliance.coverage_effective import compute_version_effective_coverage

def compute_coverage_summary(
    db: Session,
    version_id: int,
    scope_type: str,
    scope_id: int,
) -> CoverageSummary:
    """
    Computes KPI-style coverage summary for a framework version within a specific scope.
    Leverages the per-requirement coverage computed by coverage_effective.
    """
    fcov = compute_version_effective_coverage(
        db=db, version_id=version_id, scope_type=scope_type, scope_id=scope_id
    )

    total = len(fcov.requirements)
    if total == 0:
        return CoverageSummary(
            version_id=version_id,
            scope_type=scope_type,
            scope_id=scope_id,
            total_requirements=0,
            applicable_requirements=0,
            met=0,
            met_by_exception=0,
            partial=0,
            gap=0,
            unknown=0,
            coverage_pct=0.0,
            coverage_pct_excl_exceptions=0.0,
            avg_score=0.0,
            last_computed_at=datetime.utcnow(),
        )

    met = partial = gap = unknown = met_by_exception = 0
    score_sum = 0.0

    for r in fcov.requirements:
        score_sum += (r.score or 0.0)
        if r.status == "met":
            met += 1
            if getattr(r, "exception_applied", False):
                met_by_exception += 1
        elif r.status == "partial":
            partial += 1
        elif r.status == "gap":
            gap += 1
        else:
            unknown += 1

    applicable = total - unknown
    if applicable <= 0:
        coverage_pct = 0.0
        coverage_pct_excl_exceptions = 0.0
    else:
        coverage_pct = round((met / applicable) * 100.0, 2)
        coverage_pct_excl_exceptions = round(((met - met_by_exception) / applicable) * 100.0, 2)

    avg_score = round(score_sum / max(total, 1), 4)

    return CoverageSummary(
        version_id=version_id,
        scope_type=scope_type,
        scope_id=scope_id,
        total_requirements=total,
        applicable_requirements=applicable,
        met=met,
        met_by_exception=met_by_exception,
        partial=partial,
        gap=gap,
        unknown=unknown,
        coverage_pct=coverage_pct,
        coverage_pct_excl_exceptions=coverage_pct_excl_exceptions,
        avg_score=avg_score,
        last_computed_at=datetime.utcnow(),
    )
