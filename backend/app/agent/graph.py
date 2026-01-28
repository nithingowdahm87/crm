import json
from typing import Any, Dict

from langchain_core.messages import HumanMessage
from langchain_groq import ChatGroq
from langgraph.graph import StateGraph, START, END
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.models import HCP, Interaction, AgentToolRun
from app.schemas import AgentChatResponse, AgentEditResponse

llm = ChatGroq(model=settings.GROQ_MODEL, api_key=settings.GROQ_API_KEY)

class State(Dict[str, Any]):
    message: str
    hcp_id: int
    interaction_id: int | None = None
    extracted: dict[str, Any] | None = None
    reply: str | None = None
    suggested_followups: list[str] = []

def _persist_tool_run(tool_name: str, output: Any, db: Session, interaction_id: int | None = None):
    run = AgentToolRun(
        interaction_id=interaction_id,
        tool=tool_name,
        output=json.dumps(output, default=str) if not isinstance(output, str) else output
    )
    db.add(run)
    db.commit()

def tool_get_hcp_profile(state: State, db: Session):
    hcp = db.query(HCP).filter(HCP.id == state["hcp_id"]).first()
    _persist_tool_run("get_hcp_profile", {"name": hcp.name, "specialty": hcp.specialty, "organization": hcp.organization} if hcp else {}, db)
    return {"hcp_profile": hcp}

def tool_list_recent_interactions(state: State, db: Session):
    interactions = db.query(Interaction).filter(Interaction.hcp_id == state["hcp_id"]).order_by(Interaction.created_at.desc()).limit(5).all()
    _persist_tool_run("list_recent_interactions", [{"id": i.id, "interaction_type": i.interaction_type, "topics": i.topics} for i in interactions], db)
    return {"recent_interactions": interactions}

def _extract_interaction_from_chat(message: str) -> dict[str, Any]:
    prompt = f"""
Extract structured fields from this interaction log. Return JSON only.
Fields: interaction_type, sentiment, topics, outcomes, follow_up_actions, attendees, materials, samples.
If a field is not mentioned, return null or empty string.

Message: {message}
"""
    resp = llm.invoke([HumanMessage(content=prompt)])
    try:
        extracted = json.loads(resp.content.strip())
    except Exception:
        extracted = {}
    return extracted

def tool_log_interaction(state: State, db: Session):
    extracted = state.get("extracted") or {}
    interaction = Interaction(
        hcp_id=state["hcp_id"],
        interaction_type=extracted.get("interaction_type"),
        sentiment=extracted.get("sentiment"),
        topics=extracted.get("topics"),
        outcomes=extracted.get("outcomes"),
        follow_up_actions=extracted.get("follow_up_actions"),
        attendees=extracted.get("attendees"),
        materials=extracted.get("materials"),
        samples=extracted.get("samples"),
    )
    db.add(interaction)
    db.commit()
    db.refresh(interaction)
    _persist_tool_run("log_interaction", {"interaction_id": interaction.id, "fields": extracted}, db, interaction_id=interaction.id)
    return {"interaction_id": interaction.id, "interaction": interaction}

def tool_generate_followup_suggestions(state: State, db: Session):
    hcp = db.query(HCP).filter(HCP.id == state["hcp_id"]).first()
    recent = db.query(Interaction).filter(Interaction.hcp_id == state["hcp_id"]).order_by(Interaction.created_at.desc()).limit(3).all()
    context = f"HCP: {hcp.name if hcp else 'Unknown'}. Recent topics: {[i.topics for i in recent if i.topics]}"
    prompt = f"Suggest 2-3 concise follow-up actions based on:\n{context}"
    resp = llm.invoke([HumanMessage(content=prompt)])
    suggestions = [line.strip("- ").strip() for line in resp.content.splitlines() if line.strip()]
    _persist_tool_run("generate_followup_suggestions", suggestions, db)
    return {"suggested_followups": suggestions}

def tool_edit_interaction(state: State, db: Session, patch: dict[str, Any]):
    interaction = db.query(Interaction).filter(Interaction.id == state["interaction_id"]).first()
    if not interaction:
        raise Exception("Interaction not found")
    for k, v in patch.items():
        if hasattr(interaction, k):
            setattr(interaction, k, v)
    db.commit()
    db.refresh(interaction)
    _persist_tool_run("edit_interaction", {"interaction_id": interaction.id, "patch": patch}, db, interaction_id=interaction.id)
    return {"interaction": interaction}

def ingest(state: State, db: Session):
    tool_get_hcp_profile(state, db)
    tool_list_recent_interactions(state, db)
    extracted = _extract_interaction_from_chat(state["message"])
    state["extracted"] = extracted
    return state

def log_and_generate(state: State, db: Session):
    tool_log_interaction(state, db)
    result = tool_generate_followup_suggestions(state, db)
    state["suggested_followups"] = result.get("suggested_followups", [])
    state["interaction_id"] = result.get("interaction_id")
    state["reply"] = "Logged. Follow-ups: " + "; ".join(state["suggested_followups"])
    return state

# Create a class to hold the database session
class GraphRunner:
    def __init__(self, db: Session):
        self.db = db
    
    def ingest_node(self, state: State):
        return ingest(state, self.db)
    
    def log_and_generate_node(self, state: State):
        return log_and_generate(state, self.db)

def run_chat_agent(message: str, hcp_id: int, db: Session) -> AgentChatResponse:
    runner = GraphRunner(db)
    
    # Create a new graph instance with the database session
    graph = StateGraph(State)
    graph.add_node("ingest", runner.ingest_node)
    graph.add_node("log_and_generate", runner.log_and_generate_node)
    graph.add_edge(START, "ingest")
    graph.add_edge("ingest", "log_and_generate")
    graph.add_edge("log_and_generate", END)
    app = graph.compile()
    
    state = State(message=message, hcp_id=hcp_id)
    result = app.invoke(state)
    return AgentChatResponse(
        reply=result.get("reply", "Done"),
        interaction_id=result.get("interaction_id"),
        suggested_followups=result.get("suggested_followups", [])
    )

def run_edit_agent(interaction_id: int, patch: dict[str, Any], db: Session) -> AgentEditResponse:
    state = State(interaction_id=interaction_id)
    out = tool_edit_interaction(state, db, patch)
    return AgentEditResponse(updated=True, interaction=out["interaction"])
