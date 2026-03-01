"""Authentication endpoints"""
from fastapi import APIRouter

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login")
async def login():
    """Login endpoint"""
    pass


@router.post("/register")
async def register():
    """Register endpoint"""
    pass
