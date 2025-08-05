from fastapi import APIRouter
from .main_dashboard import router as main_dashboard_router

router = APIRouter()
router.include_router(main_dashboard_router)
