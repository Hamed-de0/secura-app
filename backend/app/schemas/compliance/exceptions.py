from typing import Optional, Literal, List
from datetime import date, datetime
from pydantic import BaseModel, ConfigDict, model_validator

ExceptionStatus = Literal["draft","submitted","approved","rejected","active","expired","withdrawn"]


class ComplianceExceptionBase(BaseModel):
    # optional linkage to risk scenario
    risk_scenario_context_id: Optional[int] = None

    # targets (at least one must be provided)
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
    end_date: Optional[date] = None  # open-ended allowed

    @model_validator(mode="after")
    def validate_targets_and_dates(self):
        if not (self.control_id or self.framework_requirement_id):
            raise ValueError("At least one of framework_requirement_id or control_id must be provided.")
        if self.end_date is not None and self.start_date is not None and self.start_date > self.end_date:
            raise ValueError("start_date must be <= end_date.")
        return self


class ComplianceExceptionCreate(ComplianceExceptionBase):
    status: ExceptionStatus = "draft"


class ComplianceExceptionUpdate(BaseModel):
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

    @model_validator(mode="after")
    def validate_update_dates(self):
        if self.start_date is not None and self.end_date is not None and self.start_date > self.end_date:
            raise ValueError("start_date must be <= end_date.")
        return self


class ComplianceExceptionOut(BaseModel):
    id: int
    risk_scenario_context_id: Optional[int]
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
    end_date: Optional[date]
    status: ExceptionStatus
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ComplianceExceptionCommentCreate(BaseModel):
    author: str
    body: str


class ComplianceExceptionCommentOut(BaseModel):
    id: int
    exception_id: int
    author: str
    body: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
