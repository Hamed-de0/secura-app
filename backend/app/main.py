from fastapi import FastAPI
from app.api import (asset, asset_scan, asset_type,
                     asset_owner, asset_relation, asset_maintenance, asset_group,
                     asset_security_profile, asset_lifecycle_event)

app = FastAPI()

app.include_router(asset.router)
app.include_router(asset_type.router)
app.include_router(asset_group.router)
app.include_router(asset_owner.router)
app.include_router(asset_relation.router)
app.include_router(asset_lifecycle_event.router)
app.include_router(asset_maintenance.router)
app.include_router(asset_scan.router)
app.include_router(asset_security_profile.router)
# app.include_router(asset.router)
# app.include_router(asset_group.router)

@app.get("/")
def read_root():
    return {"message": "Secura backend is running"}


