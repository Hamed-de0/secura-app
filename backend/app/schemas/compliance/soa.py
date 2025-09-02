from typing import Optional, Literal, List
from datetime import date
from pydantic import BaseModel, ConfigDict, model_validator

Applicability = Literal["applicable", "na"]

class SoAUpsertIn(BaseModel):
    scope_type: str
    scope_id: int
    control_id: int
    applicability: Applicability
    justification: Optional[str] = None
    approver: Optional[str] = None
    decided_at: Optional[date] = None
    expires_at: Optional[date] = None
    owner: Optional[str] = None

    @model_validator(mode="after")
    def _validate_dates(self):
        if self.expires_at and self.decided_at and self.expires_at < self.decided_at:
            raise ValueError("expires_at must be >= decided_at")
        return self

class SoAItemOut(BaseModel):
    control_id: int
    control_code: str
    title: str

    applicability: Applicability
    justification: Optional[str] = None
    approver: Optional[str] = None
    decided_at: Optional[date] = None
    expires_at: Optional[date] = None
    owner: Optional[str] = None

    evidence_count: int
    last_evidence_at: Optional[date] = None
    exceptions_count: int

    model_config = ConfigDict(from_attributes=True)
