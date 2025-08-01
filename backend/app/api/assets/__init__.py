from fastapi import APIRouter
from .asset import router as asset_router
from .asset_group import router as asset_group_router
from .asset_lifecycle_event import router as asset_lifecycle_event_router
from .asset_tag import router as asset_tag_router
from .asset_type import router as asset_type_router
from .asset_scan import router as asset_scan_router
from .asset_owner import router as asset_owner_router
from .asset_relation import router as asset_relation_router
from .asset_maintenance import router as asset_maintenance_router
from .asset_security_profile import router as asset_security_profile_router
from .lifecycle_event_type import router as lifecycle_event_type_router

router = APIRouter()

router.include_router(asset_router)
router.include_router(asset_group_router)
router.include_router(asset_lifecycle_event_router)
router.include_router(asset_tag_router)
router.include_router(asset_type_router)
router.include_router(asset_scan_router)
router.include_router(asset_owner_router)
router.include_router(asset_relation_router)
router.include_router(asset_maintenance_router)
router.include_router(asset_security_profile_router)
router.include_router(lifecycle_event_type_router)
