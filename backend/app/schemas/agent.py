"""Agent schemas"""
from pydantic import BaseModel
from datetime import datetime


class AgentBase(BaseModel):
    """Base agent schema"""
    name: str
    description: str
    type: str


class AgentCreate(AgentBase):
    """Agent creation schema"""
    pass


class Agent(AgentBase):
    """Agent schema"""
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
