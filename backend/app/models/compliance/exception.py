from datetime import datetime, date
from sqlalchemy import (
    Column, Integer, String, Text, Date, DateTime, ForeignKey, Index
)
from sqlalchemy.orm import relationship
from app.core.base import Base

class ComplianceException(Base):
    __tablename__ = "compliance_exceptions"

    id = Column(Integer, primary_key=True)

    # scope (your existing context)
    risk_scenario_context_id = Column(
        Integer, ForeignKey("risk_scenario_contexts.id", ondelete="CASCADE"),
        nullable=False
    )

    # targets (one or both can be set)
    control_id = Column(Integer, ForeignKey("controls.id", ondelete="SET NULL"), nullable=True)
    framework_requirement_id = Column(Integer, ForeignKey("framework_requirements.id", ondelete="SET NULL"), nullable=True)

    # info
    title = Column(String(300), nullable=False)
    description = Column(Text, nullable=True)
    reason = Column(Text, nullable=True)
    risk_acceptance_ref = Column(String(500), nullable=True)  # URL or reference code
    compensating_controls = Column(Text, nullable=True)       # free text for now

    requested_by = Column(String(120), nullable=True)
    owner = Column(String(120), nullable=True)

    # lifecycle
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    status = Column(String(30), default="draft", nullable=False)  # draft|submitted|approved|rejected|active|expired|withdrawn

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # relationships (lazy keep default to avoid heavy joins)
    context = relationship("RiskScenarioContext")
    control = relationship("Control")
    requirement = relationship("FrameworkRequirement")

    __table_args__ = (
        Index("ix_exc_context", "risk_scenario_context_id"),
        Index("ix_exc_status", "status"),
        Index("ix_exc_target_ctrl", "control_id"),
        Index("ix_exc_target_req", "framework_requirement_id"),
    )

class ComplianceExceptionComment(Base):
    __tablename__ = "compliance_exception_comments"

    id = Column(Integer, primary_key=True)
    exception_id = Column(Integer, ForeignKey("compliance_exceptions.id", ondelete="CASCADE"), nullable=False)
    author = Column(String(120), nullable=False)
    body = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
