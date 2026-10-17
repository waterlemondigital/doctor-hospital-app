from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from sqlalchemy.orm import selectinload
from app.db.postgres import get_db
from app.models import Doctor, Hospital, DoctorHospitalAffiliation
from app.schemas.doctor import DoctorOut, AffiliationOut
from app.core.cache import api_cache

router = APIRouter(prefix="/doctors", tags=["Doctors"])

def format_doctor_response(doctor: Doctor) -> DoctorOut:
    """Format Doctor SQLAlchemy model with hospital affiliations."""
    affiliations_out = []
    for aff in doctor.affiliations:
        hosp = aff.hospital
        affiliations_out.append(
            AffiliationOut(
                hospital_id=aff.hospital_id,
                hospital_name=hosp.name if hosp else None,
                hospital_slug=hosp.slug if hosp else None,
                hospital_city=hosp.city if hosp else None,
                days=aff.days,
                timings=aff.timings,
                note=aff.note,
            )
        )

    return DoctorOut(
        id=doctor.id,
        slug=doctor.slug,
        name=doctor.name,
        title=doctor.title,
        department=doctor.department,
        department_slug=doctor.department_slug,
        speciality=doctor.speciality,
        speciality_slug=doctor.speciality_slug,
        sub_speciality=doctor.sub_speciality,
        qualifications=doctor.qualifications,
        experience_years=doctor.experience_years,
        photo=doctor.photo,
        summary=doctor.summary,
        city=doctor.city,
        state=doctor.state,
        area=doctor.area,
        location=doctor.location,
        phone=doctor.phone,
        whatsapp=doctor.whatsapp,
        verification_status=doctor.verification_status,
        last_checked=doctor.last_checked,
        languages=doctor.languages or [],
        areas_of_practice=doctor.areas_of_practice or [],
        sources=doctor.sources or [],
        hospitals=affiliations_out,
    )

from app.core.directory_store import directory_store

@router.get("", response_model=List[DoctorOut])
async def list_doctors(
    city: Optional[str] = Query(None, description="Filter by city (e.g. pune, mumbai)"),
    speciality: Optional[str] = Query(None, description="Filter by clinical speciality"),
    hospital: Optional[str] = Query(None, description="Filter by consulting hospital ID"),
    search: Optional[str] = Query(None, description="Free text search query"),
    db: AsyncSession = Depends(get_db),
):
    """List doctors with relational filtering on City, Speciality, and Hospital in < 1ms."""
    if not directory_store.is_loaded:
        await directory_store.warm()
    return directory_store.get_doctors(
        city=city,
        speciality=speciality,
        hospital=hospital,
        search=search,
    )

@router.get("/{slug}", response_model=DoctorOut)
async def get_doctor_by_slug(slug: str, db: AsyncSession = Depends(get_db)):
    """Retrieve full doctor profile by URL slug."""
    if not directory_store.is_loaded:
        await directory_store.warm()
    doctor = directory_store.get_doctor_by_slug_or_id(slug)
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Doctor with slug '{slug}' not found",
        )
    return doctor
