from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models import HCP
from app.schemas import HCP as HCPSchema

router = APIRouter()

@router.get("/", response_model=list[HCPSchema])
def list_hcps(db: Session = Depends(get_db)):
    return db.query(HCP).all()

@router.get("/{hcp_id}", response_model=HCPSchema)
def get_hcp(hcp_id: int, db: Session = Depends(get_db)):
    hcp = db.query(HCP).filter(HCP.id == hcp_id).first()
    if not hcp:
        raise HTTPException(status_code=404, detail="HCP not found")
    return hcp
