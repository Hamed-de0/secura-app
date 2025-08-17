# app/services/controls/effective_overlay.py
from typing import Dict, List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_

from app.constants.scopes import PRECEDENCE, normalize_scope
from app.schemas.controls.effective_control import EffectiveControlOut
from app.schemas.controls.effective_control_verbose import (
    EffectiveControlCandidate, EffectiveControlsVerboseOut, LostTo
)
from app.models.controls.control_context_link import ControlContextLink as CCL
from app.models.risks.risk_scenario_context import RiskScenarioContext as RSC
from app.models.org.entity import OrgEntity
from app.models.org.business_unit import OrgBusinessUnit
from app.models.org.service_consumer import OrgServiceConsumer

_STATUS_RANK = {"fresh":90,"evidenced":80,"verified":75,"implemented":70,"implementing":50,"planning":30,"mapped":10}
_SOURCE_RANK = {"direct":3,"provider":2,"baseline":1}

def _precedence_index(scope_type: str) -> int:
    st = normalize_scope(scope_type)
    try: return PRECEDENCE.index(st)
    except ValueError: return 999

def _compare(a: EffectiveControlOut, b: EffectiveControlOut) -> Tuple[EffectiveControlOut, EffectiveControlOut, str]:
    """Return (winner, loser, reason)."""
    pa, pb = _precedence_index(a.scope_type), _precedence_index(b.scope_type)
    if pa != pb:
        return (a, b, "more_specific") if pa < pb else (b, a, "more_specific")
    sa, sb = _STATUS_RANK.get(a.assurance_status,0), _STATUS_RANK.get(b.assurance_status,0)
    if sa != sb:
        return (a, b, "better_status") if sa > sb else (b, a, "better_status")
    ra, rb = _SOURCE_RANK.get(a.source,0), _SOURCE_RANK.get(b.source,0)
    if ra != rb:
        return (a, b, "source_preference") if ra > rb else (b, a, "source_preference")
    # stable
    return a, b, "more_specific"

def _collect_links_for_scope(db: Session, scope_type: str, scope_id: int) -> List[CCL]:
    st = normalize_scope(scope_type)
    q1 = db.query(CCL).filter(CCL.risk_scenario_context_id.is_(None), CCL.scope_type==st, CCL.scope_id==scope_id)
    q2 = db.query(CCL).join(RSC, CCL.risk_scenario_context_id==RSC.id).filter(RSC.scope_type==st, RSC.scope_id==scope_id)
    return list(q1) + list(q2)

def _build_candidate(r: CCL, source: str, base_scope: Tuple[str,int], provider_info: Optional[dict]) -> EffectiveControlCandidate:
    cand = EffectiveControlCandidate(
        control_id=r.control_id, link_id=r.id, source=source,
        assurance_status=r.assurance_status, scope_type=base_scope[0], scope_id=base_scope[1],
        notes=r.notes
    )
    if provider_info:
        cand.provider_service_id = provider_info.get("service_id")
        cand.inheritance_type = provider_info.get("inheritance_type")
        cand.responsibility = provider_info.get("responsibility")
    return cand

def _cand_to_winner(c: EffectiveControlCandidate) -> EffectiveControlOut:
    return EffectiveControlOut(
        control_id=c.control_id, link_id=c.link_id, source=c.source, assurance_status=c.assurance_status,
        scope_type=c.scope_type, scope_id=c.scope_id, provider_service_id=c.provider_service_id,
        inheritance_type=c.inheritance_type, responsibility=c.responsibility, notes=c.notes
    )

def _overlay_core(db: Session, scope_type: str, scope_id: int) -> EffectiveControlsVerboseOut:
    scope_type = normalize_scope(scope_type)
    winners: Dict[int, EffectiveControlOut] = {}
    candidates: List[EffectiveControlCandidate] = []

    def _consider(rows: List[CCL], source: str, base_scope: Tuple[str,int], provider_info: Optional[dict]=None):
        nonlocal winners, candidates
        for r in rows:
            cand = _build_candidate(r, source, base_scope, provider_info)
            candidates.append(cand)
            cur = winners.get(cand.control_id)
            if not cur:
                winners[cand.control_id] = _cand_to_winner(cand)
                continue
            win, lose, reason = _compare(cur, _cand_to_winner(cand))
            winners[cand.control_id] = win
            # mark loser with reason
            if reason and (lose.control_id == cand.control_id):
                cand.lost_to = LostTo(scope_type=win.scope_type, scope_id=win.scope_id, reason=reason)

    # Direct links at requested scope
    _consider(_collect_links_for_scope(db, scope_type, scope_id), "direct", (scope_type, scope_id))

    # Entity/BU overlays: parent + providers + org_group baseline
    if scope_type in ("entity","bu"):
        entity_id = None
        group_id = None
        if scope_type == "entity":
            ent = db.query(OrgEntity).get(scope_id)
            if ent: entity_id, group_id = ent.id, ent.group_id
        else:
            bu = db.query(OrgBusinessUnit).get(scope_id)
            if bu:
                entity_id = bu.entity_id
                ent = db.query(OrgEntity).get(entity_id)
                group_id = getattr(ent, "group_id", None)
            if entity_id:
                _consider(_collect_links_for_scope(db, "entity", entity_id), "baseline", ("entity", entity_id))

        if entity_id:
            # provider services
            if scope_type == "entity":
                rows = db.query(OrgServiceConsumer).filter(
                    OrgServiceConsumer.consumer_entity_id==entity_id,
                    OrgServiceConsumer.consumer_bu_id.is_(None)
                ).all()
            else:
                rows = db.query(OrgServiceConsumer).filter(
                    or_(
                        and_(OrgServiceConsumer.consumer_entity_id==entity_id, OrgServiceConsumer.consumer_bu_id.is_(None)),
                        OrgServiceConsumer.consumer_bu_id==scope_id
                    )
                ).all()
            for sc in rows:
                provider_rows = _collect_links_for_scope(db, "service", sc.service_id)
                _consider(provider_rows, "provider", ("service", sc.service_id), {
                    "service_id": sc.service_id,
                    "inheritance_type": sc.inheritance_type,
                    "responsibility": sc.responsibility,
                })

        if group_id:
            _consider(_collect_links_for_scope(db, "org_group", group_id), "baseline", ("org_group", group_id))

    return EffectiveControlsVerboseOut(
        winners=list(winners.values()),
        candidates=candidates
    )

def get_effective_controls(db: Session, scope_type: str, scope_id: int):
    return _overlay_core(db, scope_type, scope_id).winners

def get_effective_controls_verbose(db: Session, scope_type: str, scope_id: int) -> EffectiveControlsVerboseOut:
    return _overlay_core(db, scope_type, scope_id)
