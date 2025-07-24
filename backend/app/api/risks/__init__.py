from fastapi import APIRouter
from .impact_domain import router as impact_domain_router
from .impact_rating import router as impact_rating_router
from .risk_scenario import router as risk_scenario_router
from .threat import router as threat_router
from .vulnerability import router as vulnerability_router
from .threat_links import router as threat_links_router

router = APIRouter()
router.include_router(impact_domain_router)
router.include_router(impact_rating_router)
router.include_router(risk_scenario_router)
router.include_router(threat_router)
router.include_router(vulnerability_router)
router.include_router(threat_links_router)
