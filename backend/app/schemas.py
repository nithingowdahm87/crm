from pydantic import BaseModel
from typing import List, Optional, Any

class HCPBase(BaseModel):
    name: str
    specialty: Optional[str] = None
    organization: Optional[str] = None

class HCP(HCPBase):
    id: int

    class Config:
        from_attributes = True

class InteractionBase(BaseModel):
    hcp_id: int
    interaction_type: Optional[str] = None
    sentiment: Optional[str] = None
    topics: Optional[str] = None
    outcomes: Optional[str] = None
    follow_up_actions: Optional[str] = None
    attendees: Optional[str] = None
    materials: Optional[str] = None
    samples: Optional[str] = None

class InteractionCreate(InteractionBase):
    pass

class Interaction(InteractionBase):
    id: int
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    class Config:
        from_attributes = True

class AgentChatRequest(BaseModel):
    message: str
    hcp_id: int

class AgentChatResponse(BaseModel):
    reply: str
    interaction_id: Optional[int] = None
    suggested_followups: List[str] = []

class AgentEditRequest(BaseModel):
    interaction_id: int
    patch: dict[str, Any]

class AgentEditResponse(BaseModel):
    updated: bool
    interaction: Optional[Interaction] = None

class ToolRun(BaseModel):
    tool: str
    output: Any
    created_at: Optional[str] = None

    class Config:
        from_attributes = True
