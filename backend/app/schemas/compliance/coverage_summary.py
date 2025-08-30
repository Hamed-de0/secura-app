from datetime import datetime
from pydantic import BaseModel
from typing import Optional

class CoverageSummary(BaseModel):
    version_id: int
    scope_type: str
    scope_id: int

    # Counts
    total_requirements: int
    applicable_requirements: int
    met: int
    met_by_exception: int
    partial: int
    gap: int
    unknown: int

    # Scores
    coverage_pct: float                     # includes exceptions (met/applicable * 100)
    coverage_pct_excl_exceptions: float     # excludes exception-based compliance
    avg_score: float                        # average of per-requirement scores (0..1)

    last_computed_at: datetime
