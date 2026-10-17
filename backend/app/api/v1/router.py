from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.health import router as health_router
from app.api.v1.doctors import router as doctors_router
from app.api.v1.hospitals import router as hospitals_router
from app.api.v1.laboratories import router as laboratories_router
from app.api.v1.wellness import router as wellness_router
from app.api.v1.directory import router as directory_router

api_v1_router = APIRouter()

api_v1_router.include_router(health_router)
api_v1_router.include_router(auth_router)
api_v1_router.include_router(doctors_router)
api_v1_router.include_router(hospitals_router)
api_v1_router.include_router(laboratories_router)
api_v1_router.include_router(wellness_router)
api_v1_router.include_router(directory_router)

