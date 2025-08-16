# =============================================================
# GOAL (short):
# -------------------------------------------------------------
# Build a read-only service that assembles the EFFECTIVE set of controls
# for any reporting scope (entity, BU, service, etc.). It merges:
#  - Direct control links at the target scope
#  - Inherited provider controls via org_service_consumers (for entity/BU)
#  - Baseline links from less-specific layers (e.g., org_group for an entity)
# using your precedence and status ranking (most specific wins).
#
# Files below:
#  1) app/schemas/controls/effective_control.py   (response model)
#  2) app/services/controls/effective_overlay.py  (core logic)
#  3) app/api/controls/effective.py               (GET endpoint)
#
# NOTE: If your import paths differ, tweak the imports accordingly.
# =============================================================

# =============================================================
# 1) app/schemas/controls/effective_control.py
# =============================================================
from typing import Optional, Literal
from pydantic import BaseModel, Field

EffectiveSource = Literal["direct", "provider", "baseline"]

class EffectiveControlOut(BaseModel):
    control_id: int
    link_id: Optional[int] = None
    source: EffectiveSource = Field(description="direct|provider|baseline")
    assurance_status: str

    # Scope where the winning link sits
    scope_type: str
    scope_id: int

    # Provider context (when inherited from a service)
    provider_service_id: Optional[int] = None
    inheritance_type: Optional[Literal["direct","conditional","advisory"]] = None
    responsibility: Optional[Literal["provider_owner","consumer_owner","shared"]] = None

    notes: Optional[str] = None

    class Config:
        from_attributes = True
