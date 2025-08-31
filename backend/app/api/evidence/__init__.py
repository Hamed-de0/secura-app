from fastapi import APIRouter
from .evidence import router as ev_router


router = APIRouter()
router.include_router(ev_router)
