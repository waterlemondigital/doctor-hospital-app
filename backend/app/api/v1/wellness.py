from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from app.db.postgres import get_db
from app.models.wellness import WellnessCenter
from app.schemas.wellness import WellnessCenterOut

router = APIRouter(prefix="/wellness-centers", tags=["Wellness Centers"])

@router.get("", response_model=List[WellnessCenterOut])
async def list_wellness_centers(
    city: Optional[str] = Query(None, description="Filter by city (e.g. pune)"),
    category: Optional[str] = Query(None, description="Filter by category"),
    search: Optional[str] = Query(None, description="Search by center name, area, or program"),
    db: AsyncSession = Depends(get_db),
):
    """List wellness centers with live filtering. Automatically cached by APICacheMiddleware for 5 mins."""
    stmt = select(WellnessCenter)
    if city and city != "all":
        stmt = stmt.where(WellnessCenter.city.ilike(f"%{city.strip()}%"))
    if category and category != "all":
        stmt = stmt.where(WellnessCenter.category.ilike(f"%{category.strip()}%"))
    if search:
        term = f"%{search.strip().lower()}%"
        stmt = stmt.where(
            or_(
                WellnessCenter.name.ilike(term),
                WellnessCenter.area.ilike(term),
                WellnessCenter.address.ilike(term),
                WellnessCenter.category.ilike(term),
                WellnessCenter.disciplines.ilike(term),
            )
        )
    stmt = stmt.order_by(WellnessCenter.name.asc())
    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/{slug_or_id}", response_model=WellnessCenterOut)
async def get_wellness_center(
    slug_or_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Retrieve wellness center by slug or ID. Automatically cached by APICacheMiddleware for 5 mins."""
    stmt = select(WellnessCenter).where(
        or_(WellnessCenter.id == slug_or_id, WellnessCenter.slug == slug_or_id)
    )
    result = await db.execute(stmt)
    center = result.scalar_one_or_none()
    if not center:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Wellness Center '{slug_or_id}' not found",
        )
    return center
