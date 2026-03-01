"""User schemas"""
from pydantic import BaseModel
from datetime import datetime


class UserBase(BaseModel):
    """Base user schema"""
    email: str
    username: str


class UserCreate(UserBase):
    """User creation schema"""
    password: str


class User(UserBase):
    """User schema"""
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
