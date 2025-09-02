from fastapi import APIRouter
from .ai import router as ai_router
from .auth import router as auth_router

router = APIRouter()
router.include_router(ai_router)
router.include_router(auth_router)
