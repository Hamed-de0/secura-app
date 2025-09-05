from __future__ import annotations
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class FrameworkRow(BaseModel):
    version_id: int
    framework_code: Optional[str] = None
    framework_name: Optional[str] = None
    framework_version_label: Optional[str] = None
    coverage_pct: float = 0.0
    last_computed_at: Optional[datetime] = None
    enabled: bool = True

class KPIs(BaseModel):
    open_risks: int = 0
    high_count: int = 0
    medium_count: int = 0
    low_count: int = 0
    avg_coverage_pct: float = 0.0
    evidence_due_30d: int = 0
    evidence_overdue: int = 0
    exceptions_pending: int = 0
    assets_total: int = 0
    assets_critical: int = 0

class DonutControls(BaseModel):
    controls_pass: int = 0
    controls_fail: int = 0
    controls_na: int = 0
    controls_total: int = 0

class DonutSoA(BaseModel):
    applicable_count: int = 0
    na_count: int = 0
    unknown_count: int = 0
    total_controls: int = 0

class DonutRisks(BaseModel):
    low: int = 0
    medium: int = 0
    high: int = 0
    open_total: int = 0

class OverviewSummary(BaseModel):
    scope_type: str
    scope_id: int
    as_of: datetime
    kpis: KPIs
    controls_status: DonutControls
    soa_applicability: DonutSoA
    risks_mix: DonutRisks
    frameworks: List[FrameworkRow]
