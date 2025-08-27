# app/api/risks/context_details_summaries_m4.py
from __future__ import annotations
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.m4.context_details_summaries import ContextSummariesOut, ControlsSummaryOut, EvidenceSummaryOut
from app.crud.m4.context_details_summaries import controls_summary_for_context, evidence_summary_for_context

router = APIRouter(prefix="/risks/risk_scenario_contexts", tags=["Risk Context Summaries (M4)"])

@router.get("/{context_id}/summaries/", response_model=ContextSummariesOut)
def get_context_summaries(context_id: int, db: Session = Depends(get_db)):
    controls = controls_summary_for_context(db, context_id)
    evidence = evidence_summary_for_context(db, context_id)
    return {
        "controlsSummary": controls,
        "evidenceSummary": evidence,
    }
