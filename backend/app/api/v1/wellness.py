from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.postgres import get_db
from app.schemas.wellness import WellnessCenterOut
from app.services.directory_cache import directory_store

router = APIRouter(prefix="/wellness-centers", tags=["Wellness Centers"])

@router.get("", response_model=List[WellnessCenterOut])
async def list_wellness_centers(
    city: Optional[str] = Query(None, description="Filter by city (e.g. pune)"),
    category: Optional[str] = Query(None, description="Filter by category"),
    search: Optional[str] = Query(None, description="Search by center name, area, or program"),
    refresh: bool = Query(False, description="Set true to force reload from PostgreSQL"),
    db: AsyncSession = Depends(get_db),
):
    """List wellness centers with ultra-fast in-memory filtering (<1ms)."""
    await directory_store.ensure_loaded(db, force=refresh)
    return directory_store.get_wellness_centers(city=city, category=category, search=search)

@router.get("/{slug_or_id}", response_model=WellnessCenterOut)
async def get_wellness_center(
    slug_or_id: str,
    refresh: bool = Query(False, description="Set true to force reload from PostgreSQL"),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve wellness center by slug or ID."""
    await directory_store.ensure_loaded(db, force=refresh)
    center = directory_store.get_wellness_by_slug_or_id(slug_or_id)
    if not center:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Wellness Center '{slug_or_id}' not found",
        )
    return center
