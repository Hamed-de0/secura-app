from fastapi import APIRouter
from .types import router as scopes_router


router = APIRouter()
router.include_router(scopes_router)
