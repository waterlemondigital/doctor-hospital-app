from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.postgres import get_db
from app.schemas.doctor import DoctorOut
from app.services.directory_cache import directory_store

router = APIRouter(prefix="/doctors", tags=["Doctors"])

@router.get("", response_model=List[DoctorOut])
async def list_doctors(
    city: Optional[str] = Query(None, description="Filter by city (e.g. pune, mumbai)"),
    speciality: Optional[str] = Query(None, description="Filter by clinical speciality"),
    hospital: Optional[str] = Query(None, description="Filter by consulting hospital ID"),
    search: Optional[str] = Query(None, description="Free text search query"),
    refresh: bool = Query(False, description="Set true to force reload from PostgreSQL"),
    db: AsyncSession = Depends(get_db),
):
    """
    List doctors with high-speed in-memory filtering.
    Sub-millisecond latency for all query and filter permutations.
    """
    await directory_store.ensure_loaded(db, force=refresh)
    return directory_store.get_doctors(
        city=city,
        speciality=speciality,
        hospital_id=hospital,
        search=search,
    )

@router.get("/{slug}", response_model=DoctorOut)
async def get_doctor_by_slug(
    slug: str,
    refresh: bool = Query(False, description="Set true to force reload from PostgreSQL"),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve full doctor profile by URL slug or ID."""
    await directory_store.ensure_loaded(db, force=refresh)
    doctor = directory_store.get_doctor_by_slug(slug)

    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Doctor with slug '{slug}' not found",
        )

    return doctor
