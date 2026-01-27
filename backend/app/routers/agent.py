from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models import AgentToolRun
from app.schemas import AgentChatRequest, AgentChatResponse, AgentEditRequest, AgentEditResponse, ToolRun
from app.agent.graph import run_chat_agent, run_edit_agent

router = APIRouter()

@router.post("/chat", response_model=AgentChatResponse)
def chat(req: AgentChatRequest, db: Session = Depends(get_db)):
    if not req.hcp_id:
        raise HTTPException(status_code=400, detail="hcp_id is required")
    try:
        result = run_chat_agent(req.message, req.hcp_id, db)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/edit", response_model=AgentEditResponse)
def edit(req: AgentEditRequest, db: Session = Depends(get_db)):
    try:
        result = run_edit_agent(req.interaction_id, req.patch, db)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/tool-runs", response_model=list[ToolRun])
def get_tool_runs(db: Session = Depends(get_db)):
    runs = db.query(AgentToolRun).order_by(AgentToolRun.created_at.desc()).limit(30).all()
    return runs
