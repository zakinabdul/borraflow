"""User endpoints"""
from fastapi import APIRouter

router = APIRouter(prefix="/users", tags=["users"])


@router.get("")
async def list_users():
    """List all users"""
    pass


@router.get("/{user_id}")
async def get_user(user_id: str):
    """Get user by ID"""
    pass


@router.put("/{user_id}")
async def update_user(user_id: str):
    """Update user"""
    pass
