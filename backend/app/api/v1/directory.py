from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.postgres import get_db
from app.models import City, Speciality
from app.schemas.directory import CityOut, SpecialityOut

router = APIRouter(tags=["Directory"])

@router.get("/cities", response_model=List[CityOut])
async def list_cities(db: AsyncSession = Depends(get_db)):
    """List all supported cities and their active coverage status."""
    stmt = select(City).order_by(City.is_active.desc(), City.name.asc())
    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/specialities", response_model=List[SpecialityOut])
async def list_specialities(db: AsyncSession = Depends(get_db)):
    """List all verified clinical specialities."""
    stmt = select(Speciality).order_by(Speciality.name.asc())
    result = await db.execute(stmt)
    return result.scalars().all()
