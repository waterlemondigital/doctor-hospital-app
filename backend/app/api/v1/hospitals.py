from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from sqlalchemy.orm import selectinload
from app.db.postgres import get_db
from app.models import Hospital, DoctorHospitalAffiliation
from app.schemas.hospital import HospitalOut, HospitalDoctorAffiliationOut
from app.core.cache import api_cache

router = APIRouter(prefix="/hospitals", tags=["Hospitals"])

def format_hospital_response(hospital: Hospital) -> HospitalOut:
    """Format Hospital SQLAlchemy model with affiliated doctors."""
    doctors_out = []
    for aff in hospital.affiliations:
        doc = aff.doctor
        doctors_out.append(
            HospitalDoctorAffiliationOut(
                doctor_id=aff.doctor_id,
                doctor_name=doc.name if doc else None,
                doctor_slug=doc.slug if doc else None,
                speciality=doc.speciality if doc else None,
                days=aff.days,
                timings=aff.timings,
                note=aff.note,
            )
        )

    return HospitalOut(
        id=hospital.id,
        slug=hospital.slug,
        name=hospital.name,
        state=hospital.state,
        city=hospital.city,
        area=hospital.area,
        address=hospital.address,
        pincode=hospital.pincode,
        facility_type=hospital.facility_type,
        facility_type_badge=hospital.facility_type_badge,
        overview=hospital.overview,
        bed_count=hospital.bed_count,
        emergency_available_24x7=hospital.emergency_available_24x7,
        website=hospital.website,
        phone=hospital.phone,
        whatsapp=hospital.whatsapp,
        maps_url=hospital.maps_url,
        verification_status=hospital.verification_status,
        last_checked=hospital.last_checked,
        images=hospital.images or [],
        services=hospital.services or [],
        departments=hospital.departments or [],
        facilities=hospital.facilities or [],
        sources=hospital.sources or [],
        doctors=doctors_out,
    )

from app.core.directory_store import directory_store

@router.get("", response_model=List[HospitalOut])
async def list_hospitals(
    city: Optional[str] = Query(None, description="Filter by city (e.g. pune, mumbai)"),
    state: Optional[str] = Query(None, description="Filter by state (e.g. maharashtra)"),
    search: Optional[str] = Query(None, description="Free text search query"),
    db: AsyncSession = Depends(get_db),
):
    """List hospitals with city, state, and text search filters with sub-millisecond response."""
    if not directory_store.is_loaded:
        await directory_store.warm()
    return directory_store.get_hospitals(city=city, state=state, search=search)

@router.get("/{slug}", response_model=HospitalOut)
async def get_hospital_by_slug(slug: str, db: AsyncSession = Depends(get_db)):
    """Retrieve full hospital profile by URL slug."""
    if not directory_store.is_loaded:
        await directory_store.warm()
    hosp = directory_store.get_hospital_by_slug_or_id(slug)
    if not hosp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Hospital with slug '{slug}' not found",
        )
    return hosp
