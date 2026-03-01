"""Authentication schemas"""
from pydantic import BaseModel


class LoginRequest(BaseModel):
    """Login request schema"""
    username: str
    password: str


class Token(BaseModel):
    """Token schema"""
    access_token: str
    token_type: str
