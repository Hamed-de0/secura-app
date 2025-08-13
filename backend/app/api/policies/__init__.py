from fastapi import APIRouter
from .risk_appetite import router as risk_appetite_router
from .control_applicability import router as control_applicability_router

router = APIRouter()

router.include_router(risk_appetite_router)
router.include_router(control_applicability_router)

