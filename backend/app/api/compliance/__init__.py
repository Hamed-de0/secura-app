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
from .obligations import router as obligation_router
from .coverage_summary import router as coverage_summary_router
from app.api.compliance.framework_activation import router as framework_activation_router
from app.api.compliance.evidence_staleness import router as evidence_staleness_router
from app.api.compliance.requirements_status import router as requirements_status_router
from app.api.compliance.requirements_tree import router as requirement_tree_router
from app.api.compliance.requirement_detail import router as requirement_detail_router
from app.api.compliance.requirement_overview import router as requirement_overview_router
from app.api.compliance.requirement_owners import router as requirement_owner_router
from .suggested_controls import router as suggested_controls_router
from .requirement_timeline import router as requirement_timeline_router


router = APIRouter()
router.include_router(requirement_tree_router)
router.include_router(requirements_status_router)
router.include_router(requirement_detail_router)
router.include_router(requirement_overview_router)
router.include_router(requirement_owner_router)
router.include_router(suggested_controls_router)
router.include_router(requirement_timeline_router)
router.include_router(evidence_staleness_router)
router.include_router(framework_activation_router)
router.include_router(coverage_summary_router)
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
router.include_router(obligation_router)


