from fastapi import FastAPI, Depends
from app.api.risks import router as risk_router
from app.api.controls import router as control_router
from app.api.users import person
from app.api.assets import router as asset_router
from app.api.dashboards import router as dashboard_router
from app.api.policies import router as policy_router
from app.api.compliance import router as compliance_router
from app.api.org import router as org_router
from app.api import ai_router, auth_router
from app.api.scopes import router as scope_router
from app.api.evidence import router as ev_router
from app.api.iam import router as iam_router
from app.services.iam.deps import require_default_access

from app.api.assets import asset_lifecycle_event, asset_type, asset_relation, asset_group, asset_maintenance, \
    asset_security_profile, asset_tag, asset_scan, asset_owner, asset
from fastapi.middleware.cors import CORSMiddleware

# app = FastAPI(
#     swagger_ui_parameters={"persistAuthorization": True},
#     dependencies=[Depends(require_default_access)],)

app = FastAPI()

origins = [
    "*",
    # "http://localhost:9001",  # Vite dev server
    # Add more if needed (e.g., production domain)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,            # or ["*"] for all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router)
app.include_router(iam_router)
app.include_router(scope_router)
app.include_router(ai_router)
app.include_router(ev_router)
app.include_router(org_router)
app.include_router(compliance_router)
app.include_router(policy_router)
app.include_router(dashboard_router)
app.include_router(person.router)
app.include_router(risk_router, prefix="/risks")
app.include_router(control_router,prefix="/controls")
app.include_router(asset_router, prefix="")

@app.get("/")
def read_root():
    return {"message": "Secura backend is running"}


