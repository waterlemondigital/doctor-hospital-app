from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.postgres import get_db
from app.schemas.hospital import HospitalOut
from app.services.directory_cache import directory_store

router = APIRouter(prefix="/hospitals", tags=["Hospitals"])

@router.get("", response_model=List[HospitalOut])
async def list_hospitals(
    city: Optional[str] = Query(None, description="Filter by city (e.g. pune, mumbai)"),
    state: Optional[str] = Query(None, description="Filter by state (e.g. maharashtra)"),
    search: Optional[str] = Query(None, description="Free text search query"),
    refresh: bool = Query(False, description="Set true to force reload from PostgreSQL"),
    db: AsyncSession = Depends(get_db),
):
    """
    List hospitals with high-speed in-memory filtering.
    Sub-millisecond latency for all query and filter permutations.
    """
    await directory_store.ensure_loaded(db, force=refresh)
    return directory_store.get_hospitals(city=city, state=state, search=search)

@router.get("/{slug}", response_model=HospitalOut)
async def get_hospital_by_slug(
    slug: str,
    refresh: bool = Query(False, description="Set true to force reload from PostgreSQL"),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve full hospital profile by URL slug or ID."""
    await directory_store.ensure_loaded(db, force=refresh)
    hospital = directory_store.get_hospital_by_slug(slug)

    if not hospital:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Hospital with slug '{slug}' not found",
        )

    return hospital
