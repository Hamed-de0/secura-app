from fastapi import APIRouter
from .control import router as control_router
from .control_threat_link import router as control_threat_router
from .control_risk_link import router as control_risk_router
from .control_asset_link import router as control_asset_router
from .control_vulnerability_link import router as control_vulnerability_router
from .control_effect_rating import router as control_effect_rating_router
from .control_context_link import router as control_context_router

router = APIRouter()

router.include_router(control_router)
router.include_router(control_context_router)
router.include_router(control_asset_router)
router.include_router(control_risk_router)
router.include_router(control_threat_router)
router.include_router(control_vulnerability_router)
router.include_router(control_effect_rating_router)

