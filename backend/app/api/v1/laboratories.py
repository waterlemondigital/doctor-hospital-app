from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from app.db.postgres import get_db
from app.models.laboratory import Laboratory
from app.schemas.laboratory import LaboratoryOut

router = APIRouter(prefix="/laboratories", tags=["Laboratories"])

@router.get("", response_model=List[LaboratoryOut])
async def list_laboratories(
    city: Optional[str] = Query(None, description="Filter by city (e.g. pune)"),
    search: Optional[str] = Query(None, description="Search by lab name, area, or service"),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Laboratory)
    if city:
        stmt = stmt.where(Laboratory.city == city.strip().lower())
    if search:
        term = f"%{search.strip().lower()}%"
        stmt = stmt.where(
            or_(
                Laboratory.name.ilike(term),
                Laboratory.area.ilike(term),
                Laboratory.address.ilike(term),
                Laboratory.accreditation.ilike(term),
            )
        )
    stmt = stmt.order_by(Laboratory.name.asc())
    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/{slug_or_id}", response_model=LaboratoryOut)
async def get_laboratory(
    slug_or_id: str,
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Laboratory).where(
        or_(Laboratory.id == slug_or_id, Laboratory.slug == slug_or_id)
    )
    result = await db.execute(stmt)
    lab = result.scalar_one_or_none()
    if not lab:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Laboratory '{slug_or_id}' not found",
        )
    return lab
