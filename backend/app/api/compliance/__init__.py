from fastapi import APIRouter
from .frameworks import router as framework_router

router = APIRouter()

router.include_router(framework_router)
