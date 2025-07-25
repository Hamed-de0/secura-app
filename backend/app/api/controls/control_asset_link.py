from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas.controls.control_asset_link import ControlAssetLinkCreate
from app.crud.controls import control_asset_link
from app.database import get_db

router = APIRouter(prefix="/control-asset-links", tags=["Control-Asset Links"])


@router.post("/")
def create_link(link: ControlAssetLinkCreate, db: Session = Depends(get_db)):
    return control_asset_link.create_control_asset_link(db, link)


@router.delete("/")
def delete_link(control_id: int, asset_id: int, db: Session = Depends(get_db)):
    return control_asset_link.delete_control_asset_link(db, control_id, asset_id)
