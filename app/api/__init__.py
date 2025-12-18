from fastapi import APIRouter
from app.api import endpoints, websocket

api_router = APIRouter()

api_router.include_router(endpoints.router)
api_router.include_router(websocket.router)
