from fastapi import APIRouter
from .impact_domain import router as impact_domain_router
from .risk_context_impact_rating import router as risk_context_impact_rating_router
from .risk_scenario import router as risk_scenario_router
from .risk_scenario_context import router as risk_scenario_context_router
from .threat import router as threat_router
from .vulnerability import router as vulnerability_router
from .threat_links import router as threat_links_router
from .risk_category import router as risk_category_router
from .risk_score import router as risk_score_router
from .risk_engine import router as risk_engine_router
from .risk_effective import router as risk_effective_router


router = APIRouter()
router.include_router(impact_domain_router)
router.include_router(risk_effective_router)
router.include_router(risk_context_impact_rating_router)
router.include_router(risk_scenario_context_router)
router.include_router(risk_scenario_router)
router.include_router(threat_router)
router.include_router(vulnerability_router)
router.include_router(threat_links_router)
router.include_router(risk_category_router)
router.include_router(risk_score_router)
router.include_router(risk_engine_router)
