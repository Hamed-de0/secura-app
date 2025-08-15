from fastapi import APIRouter
from .group import router as group_router
from .entity import router as entity_router
from .business_unit import router as business_unit_router
from .service import router as service_router
from .service_consumer import router as service_consumer_router
from .site import router as site_router


router = APIRouter()

router.include_router(group_router)
router.include_router(entity_router)
router.include_router(business_unit_router)
router.include_router(service_router)
router.include_router(service_consumer_router)
router.include_router(site_router)