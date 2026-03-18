from fastapi import APIRouter
from app.api.v1.agents import router as agent_router
from app.api.v1.health import router as health_router
from app.api.v1.users import router as user_router

api_router = APIRouter()
api_router.include_router(agent_router)
api_router.include_router(health_router)
api_router.include_router(user_router)

