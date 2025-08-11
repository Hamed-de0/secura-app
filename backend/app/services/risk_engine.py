from __future__ import annotations
from typing import Iterable, List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.models.risks.risk_scenario import RiskScenario
from app.models.risks.risk_scenario_context import RiskScenarioContext
from app.models.assets.asset_type_threat_link import AssetTypeThreatLink
from app.models.assets.asset_type_vulnerability_link import AssetTypeVulnerabilityLink
from app.models.assets.asset import Asset
from app.models.assets.asset_type import AssetType
from app.models.risks.risk_context_impact_rating import RiskContextImpactRating
from app.services.risk_analysis import calculate_risk_scores_by_context

ImpactInput = List[Dict[str, int]]  # [{"domain_id": 1, "score": 3}, ...]

class RiskEngine:
    """
    V1 Risk Engine (types-only):
      - determines applicable scenarios for an asset type (T∩V intersection)
      - generates idempotent RiskScenarioContexts at TYPE scope
      - optionally recalculates scores
    Future: extend to tags/groups/assets and 'effective' overlay queries.
    """

    def __init__(self, db: Session):
        self.db = db

    # ---------- Applicability ----------

    def applicable_scenarios_for_type(self, asset_type_id: int) -> List[RiskScenario]:
        """
        A scenario S(threat_id, vulnerability_id) applies to type T iff:
          T has threat_id in AssetTypeThreatLink AND
          T has vulnerability_id in AssetTypeVulnerabilityLink
        """
        q = (
            self.db.query(RiskScenario)
            .join(AssetTypeThreatLink, AssetTypeThreatLink.threat_id == RiskScenario.threat_id)
            .join(AssetTypeVulnerabilityLink, AssetTypeVulnerabilityLink.vulnerability_id == RiskScenario.vulnerability_id)
            .filter(
                AssetTypeThreatLink.asset_type_id == asset_type_id,
                AssetTypeVulnerabilityLink.asset_type_id == asset_type_id,
            )
        )
        return q.all()

    # ---------- Generation (TYPE scope) ----------

    def upsert_type_contexts(
        self,
        asset_type_id: int,
        default_likelihood: int,
        impact_ratings: ImpactInput,
        status: str = "Open",
        dry_run: bool = False,
        recalc_scores: bool = True,
    ) -> Dict[str, Any]:
        """
        Creates RiskScenarioContext rows at TYPE scope for all applicable scenarios.
        Idempotent via UNIQUE(risk_scenario_id, asset_type_id).
        Also writes RiskContextImpactRating rows (per-domain) on first creation.
        """
        scenarios = self.applicable_scenarios_for_type(asset_type_id)
        if not scenarios:
            return {"created": 0, "existing": 0, "recalculated": 0, "contexts": []}

        # Preload existing contexts for this type to avoid N queries
        existing = self.db.query(RiskScenarioContext)\
            .filter(RiskScenarioContext.asset_type_id == asset_type_id).all()
        existing_map = {(c.risk_scenario_id, c.asset_type_id): c for c in existing}

        created, existing_count, recalculated = 0, 0, 0
        touched_context_ids: List[int] = []
        contexts_preview: List[Dict[str, Any]] = []

        for s in scenarios:
            key = (s.id, asset_type_id)
            ctx = existing_map.get(key)
            if ctx is None:
                if dry_run:
                    contexts_preview.append({"risk_scenario_id": s.id, "asset_type_id": asset_type_id, "status": status})
                    continue

                ctx = RiskScenarioContext(
                    risk_scenario_id=s.id,
                    asset_type_id=asset_type_id,
                    status=status,
                    likelihood=default_likelihood,
                    threat_id=s.threat_id,               # snapshot for audit
                    vulnerability_id=s.vulnerability_id  # snapshot for audit
                )
                self.db.add(ctx)
                self.db.flush()  # get ctx.id

                # Set per-domain impact ratings
                for item in impact_ratings or []:
                    self.db.add(RiskContextImpactRating(
                        risk_scenario_context_id=ctx.id,
                        domain_id=item["domain_id"],
                        score=item["score"]
                    ))

                created += 1
                existing_map[key] = ctx
            else:
                existing_count += 1

            touched_context_ids.append(ctx.id)

        if dry_run:
            return {"created": 0, "existing": 0, "recalculated": 0, "contexts": contexts_preview}

        self.db.commit()

        # Optional scoring pass
        if recalc_scores and touched_context_ids:
            for cid in touched_context_ids:
                try:
                    calculate_risk_scores_by_context(self.db, cid)
                    recalculated += 1
                except Exception:
                    # Don't break the batch for scoring hiccups
                    pass
            self.db.commit()

        return {
            "created": created,
            "existing": existing_count,
            "recalculated": recalculated,
            "contexts_count": len(touched_context_ids),
        }

    # ---------- Helper (nice-to-have) ----------

    def preview_by_type(self, asset_type_id: int) -> Dict[str, Any]:
        """
        Show how many scenarios would be created for this type and sample titles.
        """
        scenarios = self.applicable_scenarios_for_type(asset_type_id)
        titles = [{"id": s.id, "title_en": getattr(s, "title_en", None)} for s in scenarios[:20]]
        return {"applicable": len(scenarios), "sample": titles}
