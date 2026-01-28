from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models import Interaction
from app.schemas import Interaction as InteractionSchema, InteractionCreate

router = APIRouter()

@router.get("/", response_model=list[InteractionSchema])
def list_interactions(db: Session = Depends(get_db)):
    return db.query(Interaction).order_by(Interaction.created_at.desc()).limit(50).all()

@router.get("/{interaction_id}", response_model=InteractionSchema)
def get_interaction(interaction_id: int, db: Session = Depends(get_db)):
    interaction = db.query(Interaction).filter(Interaction.id == interaction_id).first()
    if not interaction:
        raise HTTPException(status_code=404, detail="Interaction not found")
    return interaction

@router.post("/")
def create_interaction(interaction: InteractionCreate, db: Session = Depends(get_db)):
    db_interaction = Interaction(**interaction.model_dump())
    db.add(db_interaction)
    db.commit()
    db.refresh(db_interaction)
    
    # Convert datetime to string for response
    response_data = {
        "id": db_interaction.id,
        "hcp_id": db_interaction.hcp_id,
        "interaction_type": db_interaction.interaction_type,
        "sentiment": db_interaction.sentiment,
        "topics": db_interaction.topics,
        "outcomes": db_interaction.outcomes,
        "follow_up_actions": db_interaction.follow_up_actions,
        "attendees": db_interaction.attendees,
        "materials": db_interaction.materials,
        "samples": db_interaction.samples,
        "created_at": db_interaction.created_at.isoformat() if db_interaction.created_at else None,
        "updated_at": db_interaction.updated_at.isoformat() if db_interaction.updated_at else None,
    }
    return response_data

@router.put("/{interaction_id}", response_model=InteractionSchema)
def update_interaction(interaction_id: int, updates: dict, db: Session = Depends(get_db)):
    db_interaction = db.query(Interaction).filter(Interaction.id == interaction_id).first()
    if not db_interaction:
        raise HTTPException(status_code=404, detail="Interaction not found")
    for key, value in updates.items():
        if hasattr(db_interaction, key):
            setattr(db_interaction, key, value)
    db.commit()
    db.refresh(db_interaction)
    return db_interaction
