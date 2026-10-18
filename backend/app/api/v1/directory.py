from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.postgres import get_db
from app.schemas.directory import CityOut, SpecialityOut
from app.services.directory_cache import directory_store

router = APIRouter(tags=["Directory"])

@router.get("/cities", response_model=List[CityOut])
async def list_cities(db: AsyncSession = Depends(get_db)):
    """List all supported cities and their active coverage status (<1ms)."""
    await directory_store.ensure_loaded(db)
    return directory_store.get_cities()

@router.get("/specialities", response_model=List[SpecialityOut])
async def list_specialities(db: AsyncSession = Depends(get_db)):
    """List all verified clinical specialities (<1ms)."""
    await directory_store.ensure_loaded(db)
    return directory_store.get_specialities()
