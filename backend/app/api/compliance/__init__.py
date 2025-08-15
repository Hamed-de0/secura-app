from fastapi import APIRouter
from .frameworks import router as framework_router
from .framework_requirements import router as framework_requirements_router
from .control_framework_mappings import router as control_framework_mapping_router
from .coverage import router as coverage_router
from .imports import router as imports_router
from .framework_versions import router as framework_version_router
from .evidence import router as evidence_router
from .evidence_policies import router as evidence_policies_router
from .assurance import router as assurance_router
from .exceptions import router as exception_router
from .crosswalk_imports import router as crosswalks_imports_router

router = APIRouter()

router.include_router(framework_router)
router.include_router(framework_requirements_router)
router.include_router(control_framework_mapping_router)
router.include_router(coverage_router)
router.include_router(imports_router)
router.include_router(framework_version_router)
router.include_router(evidence_policies_router)
router.include_router(evidence_router)
router.include_router(assurance_router)
router.include_router(exception_router)
router.include_router(crosswalks_imports_router)


