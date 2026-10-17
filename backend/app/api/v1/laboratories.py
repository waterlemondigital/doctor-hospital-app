from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.postgres import get_db
from app.schemas.laboratory import LaboratoryOut
from app.core.directory_store import directory_store

router = APIRouter(prefix="/laboratories", tags=["Laboratories"])

@router.get("", response_model=List[LaboratoryOut])
async def list_laboratories(
    city: Optional[str] = Query(None, description="Filter by city (e.g. pune)"),
    search: Optional[str] = Query(None, description="Search by lab name, area, or service"),
    db: AsyncSession = Depends(get_db),
):
    """List laboratories with live filtering in < 1ms."""
    if not directory_store.is_loaded:
        await directory_store.warm()
    return directory_store.get_laboratories(city=city, search=search)

@router.get("/{slug_or_id}", response_model=LaboratoryOut)
async def get_laboratory(
    slug_or_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Retrieve laboratory by slug or ID in < 1ms."""
    if not directory_store.is_loaded:
        await directory_store.warm()
    lab = directory_store.get_laboratory_by_slug_or_id(slug_or_id)
    if not lab:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Laboratory '{slug_or_id}' not found",
        )
    return lab
