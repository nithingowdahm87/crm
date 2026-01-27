from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.db.base import Base

class HCP(Base):
    __tablename__ = "hcps"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    specialty = Column(String(255))
    organization = Column(String(255))

class Interaction(Base):
    __tablename__ = "interactions"
    id = Column(Integer, primary_key=True, index=True)
    hcp_id = Column(Integer, ForeignKey("hcps.id"), nullable=False)
    interaction_type = Column(String(100))
    sentiment = Column(String(50))
    topics = Column(Text)
    outcomes = Column(Text)
    follow_up_actions = Column(Text)
    attendees = Column(Text)
    materials = Column(Text)
    samples = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class AgentToolRun(Base):
    __tablename__ = "agent_tool_runs"
    id = Column(Integer, primary_key=True, index=True)
    interaction_id = Column(Integer, ForeignKey("interactions.id"), nullable=True)
    tool = Column(String(100), nullable=False)
    output = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
