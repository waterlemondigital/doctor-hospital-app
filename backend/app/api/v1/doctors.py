from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from sqlalchemy.orm import selectinload
from app.db.postgres import get_db
from app.models import Doctor, Hospital, DoctorHospitalAffiliation
from app.schemas.doctor import DoctorOut, AffiliationOut

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
        phone="+91 78756 57402",
        whatsapp="+91 78756 57402",
        verification_status=doctor.verification_status,
        last_checked=doctor.last_checked,
        languages=doctor.languages or [],
        areas_of_practice=doctor.areas_of_practice or [],
        sources=doctor.sources or [],
        hospitals=affiliations_out,
    )

@router.get("", response_model=List[DoctorOut])
async def list_doctors(
    city: Optional[str] = Query(None, description="Filter by city (e.g. pune, mumbai)"),
    speciality: Optional[str] = Query(None, description="Filter by clinical speciality"),
    hospital: Optional[str] = Query(None, description="Filter by consulting hospital ID"),
    search: Optional[str] = Query(None, description="Free text search query"),
    db: AsyncSession = Depends(get_db),
):
    """
    List doctors with relational filtering on City, Speciality, and Hospital.
    Automatically cached by APICacheMiddleware for 5 mins.
    """
    stmt = select(Doctor)

    # 1. Hospital filter
    if hospital and hospital != "all":
        hosp_doc_subq = select(DoctorHospitalAffiliation.doctor_id).where(
            DoctorHospitalAffiliation.hospital_id == hospital
        )
        stmt = stmt.where(Doctor.id.in_(hosp_doc_subq))

    # 2. City filter (Doctor's city OR affiliated hospital's city)
    if city and city != "all":
        city_lower = city.lower().strip()
        hosp_ids_in_city = select(Hospital.id).where(Hospital.city.ilike(f"%{city_lower}%"))
        doc_ids_in_city_hospitals = select(DoctorHospitalAffiliation.doctor_id).where(
            DoctorHospitalAffiliation.hospital_id.in_(hosp_ids_in_city)
        )
        stmt = stmt.where(
            or_(
                Doctor.city.ilike(f"%{city_lower}%"),
                Doctor.id.in_(doc_ids_in_city_hospitals),
            )
        )

    # 3. Speciality filter
    if speciality and speciality != "all":
        stmt = stmt.where(Doctor.speciality.ilike(speciality.strip()))

    # 4. Free text search
    if search:
        s = f"%{search.strip().lower()}%"
        stmt = stmt.where(
            or_(
                Doctor.name.ilike(s),
                Doctor.department.ilike(s),
                Doctor.department_slug.ilike(s),
                Doctor.speciality.ilike(s),
                Doctor.sub_speciality.ilike(s),
                Doctor.city.ilike(s),
                Doctor.area.ilike(s),
                Doctor.summary.ilike(s),
            )
        )

    stmt = stmt.options(
        selectinload(Doctor.affiliations).selectinload(DoctorHospitalAffiliation.hospital)
    ).order_by(Doctor.name.asc())
    
    result = await db.execute(stmt)
    doctors = result.scalars().all()
    return [format_doctor_response(d) for d in doctors]

@router.get("/{slug}", response_model=DoctorOut)
async def get_doctor_by_slug(slug: str, db: AsyncSession = Depends(get_db)):
    """Retrieve full doctor profile by URL slug. Automatically cached by APICacheMiddleware for 5 mins."""
    stmt = (
        select(Doctor)
        .options(selectinload(Doctor.affiliations).selectinload(DoctorHospitalAffiliation.hospital))
        .where(Doctor.slug == slug)
    )
    result = await db.execute(stmt)
    doctor = result.scalar_one_or_none()

    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Doctor with slug '{slug}' not found",
        )

    return format_doctor_response(doctor)
