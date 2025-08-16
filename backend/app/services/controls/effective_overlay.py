from typing import Dict, List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_

from app.constants.scopes import PRECEDENCE, normalize_scope
from app.schemas.controls.effective_control import EffectiveControlOut

# MODELS
from app.models.controls.control_context_link import ControlContextLink as CCL
from app.models.risks.risk_scenario_context import RiskScenarioContext as RSC
from app.models.org.entity import OrgEntity
from app.models.org.business_unit import OrgBusinessUnit
from app.models.org.service_consumer import OrgServiceConsumer

# Optional models (guard imports if not present in your tree)
try:
    from app.models.assets.asset import Asset
except Exception:
    Asset = None
try:
    from app.models.org.site import OrgSite
except Exception:
    OrgSite = None

# -----------------------
# Helpers & rankings
# -----------------------
_STATUS_RANK = {
    "fresh": 90,
    "evidenced": 80,
    "verified": 75,  # if used
    "implemented": 70,
    "implementing": 50,
    "planning": 30,
    "mapped": 10,
}
_SOURCE_RANK = {"direct": 3, "provider": 2, "baseline": 1}

def _precedence_index(scope_type: str) -> int:
    st = normalize_scope(scope_type)
    try:
        return PRECEDENCE.index(st)
    except ValueError:
        return 999  # unknown scopes last

def _best(a: EffectiveControlOut, b: EffectiveControlOut) -> EffectiveControlOut:
    # 1) scope precedence (lower index wins)
    pa, pb = _precedence_index(a.scope_type), _precedence_index(b.scope_type)
    if pa != pb:
        return a if pa < pb else b
    # 2) status rank
    sa, sb = _STATUS_RANK.get(a.assurance_status, 0), _STATUS_RANK.get(b.assurance_status, 0)
    if sa != sb:
        return a if sa > sb else b
    # 3) source rank
    ra, rb = _SOURCE_RANK.get(a.source, 0), _SOURCE_RANK.get(b.source, 0)
    if ra != rb:
        return a if ra > rb else b
    return a

def _collect_links_for_scope(db: Session, scope_type: str, scope_id: int) -> List[CCL]:
    """Scope-only links + risk-linked links that resolve to this scope."""
    st = normalize_scope(scope_type)
    q1 = db.query(CCL).filter(
        CCL.risk_scenario_context_id.is_(None),
        CCL.scope_type == st,
        CCL.scope_id == scope_id,
    )
    q2 = (
        db.query(CCL)
        .join(RSC, CCL.risk_scenario_context_id == RSC.id)
        .filter(RSC.scope_type == st, RSC.scope_id == scope_id)
    )
    return list(q1) + list(q2)

def _service_links_for_consumer(db: Session, entity_id: int, bu_id: Optional[int]):
    """Return service-consumer rows for an entity/BU, deduped by strongest inheritance."""
    q = db.query(OrgServiceConsumer).filter(OrgServiceConsumer.consumer_entity_id == entity_id)
    if bu_id is None:
        q = q.filter(OrgServiceConsumer.consumer_bu_id.is_(None))
    else:
        q = q.filter(or_(OrgServiceConsumer.consumer_bu_id.is_(None),
                         OrgServiceConsumer.consumer_bu_id == bu_id))
    rows = q.all()
    rank = {"direct": 3, "conditional": 2, "advisory": 1}
    by_service = {}
    for sc in rows:
        cur = by_service.get(sc.service_id)
        if not cur or rank.get(sc.inheritance_type, 0) > rank.get(cur.inheritance_type, 0):
            by_service[sc.service_id] = sc
    return list(by_service.values())

def _resolve_asset_layers(db: Session, asset_id: int) -> Optional[dict]:
    if Asset is None:
        return None
    asset = db.query(Asset).get(asset_id)
    if not asset:
        return None

    # Support both naming styles
    atid = getattr(asset, "asset_type_id", None)
    if atid is None:
        atid = getattr(asset, "type_id", None)

    gid = getattr(asset, "asset_group_id", None)
    if gid is None:
        gid = getattr(asset, "group_id", None)

    # Tags: try common relationship names; fallback to single tag_id if you have it
    tag_ids: list[int] = []
    if hasattr(asset, "tags") and asset.tags:
        tag_ids = [getattr(t, "id", None) or getattr(getattr(t, "tag", None), "id", None) for t in asset.tags]
    elif hasattr(asset, "asset_tags") and asset.asset_tags:
        for t in asset.asset_tags:
            if hasattr(t, "id"):
                tag_ids.append(t.id)
            elif hasattr(t, "tag") and t.tag:
                tag_ids.append(t.tag.id)
    elif hasattr(asset, "tag_id") and getattr(asset, "tag_id") is not None:
        tag_ids = [getattr(asset, "tag_id")]

    tag_ids = [tid for tid in tag_ids if tid is not None]

    return {
        # normalized keys the overlay uses downstream
        "asset_type_id": atid,
        "asset_group_id": gid,
        "tag_ids": tag_ids,

        # org links (optional today)
        "entity_id": getattr(asset, "entity_id", None),
        "bu_id": getattr(asset, "business_unit_id", getattr(asset, "bu_id", None)),
        "site_id": getattr(asset, "site_id", None),
    }



# -----------------------
# Core API
# -----------------------
def get_effective_controls(db: Session, scope_type: str, scope_id: int) -> List[EffectiveControlOut]:
    scope_type = normalize_scope(scope_type)
    winners: Dict[int, EffectiveControlOut] = {}

    def _consider(rows: List[CCL], source: str, base_scope: Tuple[str, int], provider_info: Optional[dict] = None):
        for r in rows:
            ec = EffectiveControlOut(
                control_id=r.control_id,
                link_id=r.id,
                source=source,
                assurance_status=r.assurance_status,
                scope_type=base_scope[0],
                scope_id=base_scope[1],
                notes=r.notes,
            )
            if provider_info:
                ec.provider_service_id = provider_info.get("service_id")
                ec.inheritance_type = provider_info.get("inheritance_type")
                ec.responsibility = provider_info.get("responsibility")
            cur = winners.get(ec.control_id)
            winners[ec.control_id] = _best(cur, ec) if cur else ec

    # 1) Direct links at the requested scope
    _consider(_collect_links_for_scope(db, scope_type, scope_id), "direct", (scope_type, scope_id))

    # 2) Entity/BU overlays (provider + org_group + entity baseline for BU)
    if scope_type in ("entity", "bu"):
        entity_id: Optional[int] = None
        group_id: Optional[int] = None

        if scope_type == "entity":
            ent = db.query(OrgEntity).get(scope_id)
            if ent:
                entity_id, group_id = ent.id, ent.group_id

        elif scope_type == "bu":
            bu = db.query(OrgBusinessUnit).get(scope_id)
            if bu:
                entity_id = bu.entity_id
                ent = db.query(OrgEntity).get(entity_id)
                if ent:
                    group_id = ent.group_id
            if entity_id:
                _consider(_collect_links_for_scope(db, "entity", entity_id), "baseline", ("entity", entity_id))

        if entity_id:
            # provider services
            for sc in _service_links_for_consumer(db, entity_id, scope_id if scope_type == "bu" else None):
                provider_rows = _collect_links_for_scope(db, "service", sc.service_id)
                _consider(
                    provider_rows,
                    "provider",
                    ("service", sc.service_id),
                    provider_info={
                        "service_id": sc.service_id,
                        "inheritance_type": sc.inheritance_type,
                        "responsibility": sc.responsibility,
                    },
                )

        if group_id:
            _consider(_collect_links_for_scope(db, "org_group", group_id), "baseline", ("org_group", group_id))

    # 3) Asset overlays: tag/group/type (+ optional BU/site/entity/provider/group if present)
    if scope_type == "asset":
        ctx = _resolve_asset_layers(db, scope_id)
        if ctx:
            # tag baselines
            for tid in ctx.get("tag_ids", []) or []:
                _consider(_collect_links_for_scope(db, "tag", tid), "baseline", ("tag", tid))
            # group baseline
            gid = ctx.get("asset_group_id")
            if gid:
                _consider(_collect_links_for_scope(db, "asset_group", gid), "baseline", ("asset_group", gid))
            # type baseline
            atid = ctx.get("asset_type_id")
            if atid:
                _consider(_collect_links_for_scope(db, "asset_type", atid), "baseline", ("asset_type", atid))
            # optional org overlays if asset carries these pointers
            bu_id = ctx.get("bu_id")
            if bu_id:
                _consider(_collect_links_for_scope(db, "bu", bu_id), "baseline", ("bu", bu_id))
            site_id = ctx.get("site_id")
            if site_id:
                _consider(_collect_links_for_scope(db, "site", site_id), "baseline", ("site", site_id))
            ent_id = ctx.get("entity_id")
            if ent_id:
                _consider(_collect_links_for_scope(db, "entity", ent_id), "baseline", ("entity", ent_id))
                # provider services via entity / optional BU
                for sc in _service_links_for_consumer(db, ent_id, bu_id):
                    provider_rows = _collect_links_for_scope(db, "service", sc.service_id)
                    _consider(
                        provider_rows,
                        "provider",
                        ("service", sc.service_id),
                        provider_info={
                            "service_id": sc.service_id,
                            "inheritance_type": sc.inheritance_type,
                            "responsibility": sc.responsibility,
                        },
                    )
                ent = db.query(OrgEntity).get(ent_id)
                if ent and ent.group_id:
                    _consider(_collect_links_for_scope(db, "org_group", ent.group_id), "baseline", ("org_group", ent.group_id))

    # 4) Site overlays (if you model sites)
    if scope_type == "site" and OrgSite is not None:
        site = db.query(OrgSite).get(scope_id)
        if site:
            ent_id = getattr(site, "entity_id", None)
            if ent_id:
                _consider(_collect_links_for_scope(db, "entity", ent_id), "baseline", ("entity", ent_id))
                for sc in _service_links_for_consumer(db, ent_id, None):
                    provider_rows = _collect_links_for_scope(db, "service", sc.service_id)
                    _consider(
                        provider_rows,
                        "provider",
                        ("service", sc.service_id),
                        provider_info={
                            "service_id": sc.service_id,
                            "inheritance_type": sc.inheritance_type,
                            "responsibility": sc.responsibility,
                        },
                    )
                ent = db.query(OrgEntity).get(ent_id)
                if ent and ent.group_id:
                    _consider(_collect_links_for_scope(db, "org_group", ent.group_id), "baseline", ("org_group", ent.group_id))

    return list(winners.values())
