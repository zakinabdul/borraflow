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

class FormatAgentBase(BaseModel):
    raw_text: str
    user_request: str

class FormatAgentResponse(BaseModel):
    latex_content: str
    #markdown_content: str
    #selected_theme: str