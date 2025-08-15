from pydantic import BaseModel, Field
from typing import Optional, Literal, List
from datetime import date, datetime

ExceptionStatus = Literal["draft","submitted","approved","rejected","active","expired","withdrawn"]

class ComplianceExceptionBase(BaseModel):
    risk_scenario_context_id: int
    control_id: Optional[int] = None
    framework_requirement_id: Optional[int] = None

    title: str
    description: Optional[str] = None
    reason: Optional[str] = None
    risk_acceptance_ref: Optional[str] = None
    compensating_controls: Optional[str] = None

    requested_by: Optional[str] = None
    owner: Optional[str] = None

    start_date: date
    end_date: date

class ComplianceExceptionCreate(ComplianceExceptionBase):
    status: ExceptionStatus = "draft"

class ComplianceExceptionUpdate(BaseModel):
    # editable fields; status transitions use dedicated endpoints
    title: Optional[str] = None
    description: Optional[str] = None
    reason: Optional[str] = None
    risk_acceptance_ref: Optional[str] = None
    compensating_controls: Optional[str] = None
    requested_by: Optional[str] = None
    owner: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    control_id: Optional[int] = None
    framework_requirement_id: Optional[int] = None

class ComplianceExceptionOut(BaseModel):
    id: int
    risk_scenario_context_id: int
    control_id: Optional[int]
    framework_requirement_id: Optional[int]
    title: str
    description: Optional[str]
    reason: Optional[str]
    risk_acceptance_ref: Optional[str]
    compensating_controls: Optional[str]
    requested_by: Optional[str]
    owner: Optional[str]
    start_date: date
    end_date: date
    status: ExceptionStatus
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ComplianceExceptionCommentCreate(BaseModel):
    author: str
    body: str

class ComplianceExceptionCommentOut(BaseModel):
    id: int
    exception_id: int
    author: str
    body: str
    created_at: datetime

    class Config:
        from_attributes = True
