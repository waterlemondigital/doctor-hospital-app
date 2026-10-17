"""
High-Performance In-Memory Directory Store for HealthDiscover.
Eliminates cross-continental database latency (2.6s -> 0.001s) by serving
public directory entities from memory, backed by Neon PostgreSQL.
"""
import time
import logging
import asyncio
from typing import List, Optional, Dict
from sqlalchemy import select, or_
from sqlalchemy.orm import selectinload

from app.db.postgres import AsyncSessionLocal
from app.models.hospital import Hospital
from app.models.doctor import Doctor
from app.models.laboratory import Laboratory
from app.models.wellness import WellnessCenter
from app.models.affiliation import DoctorHospitalAffiliation

from app.schemas.hospital import HospitalOut, HospitalDoctorAffiliationOut
from app.schemas.doctor import DoctorOut, AffiliationOut
from app.schemas.laboratory import LaboratoryOut
from app.schemas.wellness import WellnessCenterOut

logger = logging.getLogger("healthdiscover.directory_store")

class DirectoryStore:
    def __init__(self):
        self.hospitals: List[HospitalOut] = []
        self.hospitals_by_slug: Dict[str, HospitalOut] = {}
        self.hospitals_by_id: Dict[str, HospitalOut] = {}

        self.doctors: List[DoctorOut] = []
        self.doctors_by_slug: Dict[str, DoctorOut] = {}
        self.doctors_by_id: Dict[str, DoctorOut] = {}

        self.laboratories: List[LaboratoryOut] = []
        self.laboratories_by_slug: Dict[str, LaboratoryOut] = {}
        self.laboratories_by_id: Dict[str, LaboratoryOut] = {}

        self.wellness_centers: List[WellnessCenterOut] = []
        self.wellness_by_slug: Dict[str, WellnessCenterOut] = {}
        self.wellness_by_id: Dict[str, WellnessCenterOut] = {}

        self.is_loaded = False
        self.last_loaded_at: Optional[float] = None
        self._lock = asyncio.Lock()

    async def warm(self, force: bool = False):
        """Warm or refresh directory data from PostgreSQL."""
        async with self._lock:
            if self.is_loaded and not force:
                return

            t0 = time.time()
            logger.info("⚡ Pre-warming directory store from PostgreSQL...")

            try:
                async with AsyncSessionLocal() as session:
                    # 1. Fetch Hospitals with affiliations and doctors
                    stmt_h = select(Hospital).options(
                        selectinload(Hospital.affiliations).selectinload(DoctorHospitalAffiliation.doctor)
                    ).order_by(Hospital.name.asc())
                    res_h = await session.execute(stmt_h)
                    raw_hosps = res_h.scalars().all()

                    hosps = []
                    for h in raw_hosps:
                        docs_out = []
                        for aff in h.affiliations:
                            doc = aff.doctor
                            docs_out.append(
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
                        hosps.append(
                            HospitalOut(
                                id=h.id,
                                slug=h.slug,
                                name=h.name,
                                state=h.state,
                                city=h.city,
                                area=h.area,
                                address=h.address,
                                pincode=h.pincode,
                                facility_type=h.facility_type,
                                facility_type_badge=h.facility_type_badge,
                                overview=h.overview,
                                bed_count=h.bed_count,
                                emergency_available_24x7=h.emergency_available_24x7,
                                website=h.website,
                                phone=h.phone,
                                whatsapp=h.whatsapp,
                                maps_url=h.maps_url,
                                verification_status=h.verification_status,
                                last_checked=h.last_checked,
                                images=h.images or [],
                                services=h.services or [],
                                departments=h.departments or [],
                                facilities=h.facilities or [],
                                sources=h.sources or [],
                                doctors=docs_out,
                            )
                        )

                    # 2. Fetch Doctors with hospital affiliations
                    stmt_d = select(Doctor).options(
                        selectinload(Doctor.affiliations).selectinload(DoctorHospitalAffiliation.hospital)
                    ).order_by(Doctor.name.asc())
                    res_d = await session.execute(stmt_d)
                    raw_docs = res_d.scalars().all()

                    docs = []
                    for d in raw_docs:
                        affs_out = []
                        for aff in d.affiliations:
                            hosp = aff.hospital
                            affs_out.append(
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
                        docs.append(
                            DoctorOut(
                                id=d.id,
                                slug=d.slug,
                                name=d.name,
                                title=d.title,
                                department=d.department,
                                department_slug=d.department_slug,
                                speciality=d.speciality,
                                speciality_slug=d.speciality_slug,
                                sub_speciality=d.sub_speciality,
                                qualifications=d.qualifications,
                                experience_years=d.experience_years,
                                photo=d.photo,
                                summary=d.summary,
                                city=d.city,
                                state=d.state,
                                area=d.area,
                                location=d.location,
                                phone=d.phone,
                                whatsapp=d.whatsapp,
                                verification_status=d.verification_status,
                                last_checked=d.last_checked,
                                languages=d.languages or [],
                                areas_of_practice=d.areas_of_practice or [],
                                sources=d.sources or [],
                                hospitals=affs_out,
                            )
                        )

                    # 3. Fetch Laboratories
                    stmt_l = select(Laboratory).order_by(Laboratory.name.asc())
                    res_l = await session.execute(stmt_l)
                    raw_labs = res_l.scalars().all()
                    labs = [LaboratoryOut.model_validate(l) for l in raw_labs]

                    # 4. Fetch Wellness Centers
                    stmt_w = select(WellnessCenter).order_by(WellnessCenter.name.asc())
                    res_w = await session.execute(stmt_w)
                    raw_wells = res_w.scalars().all()
                    wells = [WellnessCenterOut.model_validate(w) for w in raw_wells]

                # Update memory store atomically
                self.hospitals = hosps
                self.hospitals_by_slug = {h.slug: h for h in hosps}
                self.hospitals_by_id = {h.id: h for h in hosps}

                self.doctors = docs
                self.doctors_by_slug = {d.slug: d for d in docs}
                self.doctors_by_id = {d.id: d for d in docs}

                self.laboratories = labs
                self.laboratories_by_slug = {l.slug: l for l in labs}
                self.laboratories_by_id = {l.id: l for l in labs}

                self.wellness_centers = wells
                self.wellness_by_slug = {w.slug: w for w in wells}
                self.wellness_by_id = {w.id: w for w in wells}

                self.is_loaded = True
                self.last_loaded_at = time.time()
                elapsed = time.time() - t0
                logger.info(
                    f"🚀 Directory store warmed in {elapsed:.2f}s! "
                    f"({len(hosps)} hospitals, {len(docs)} doctors, {len(labs)} labs, {len(wells)} wellness centers). "
                    "All subsequent requests will respond in < 1ms!"
                )
            except Exception as exc:
                logger.error(f"❌ Failed to pre-warm directory store: {exc}", exc_info=True)

    # ------------------ Hospitals Queries ------------------
    def get_hospitals(
        self,
        city: Optional[str] = None,
        state: Optional[str] = None,
        search: Optional[str] = None,
    ) -> List[HospitalOut]:
        results = self.hospitals
        if city and city != "all":
            c = city.strip().lower()
            results = [h for h in results if c in h.city.lower()]
        if state and state != "all":
            s = state.strip().lower()
            results = [h for h in results if s in h.state.lower()]
        if search:
            q = search.strip().lower()
            results = [
                h for h in results
                if q in h.name.lower()
                or q in h.area.lower()
                or q in h.city.lower()
                or q in h.address.lower()
                or q in h.facility_type.lower()
            ]
        return results

    def get_hospital_by_slug_or_id(self, slug_or_id: str) -> Optional[HospitalOut]:
        return self.hospitals_by_slug.get(slug_or_id) or self.hospitals_by_id.get(slug_or_id)

    # ------------------ Doctors Queries ------------------
    def get_doctors(
        self,
        city: Optional[str] = None,
        speciality: Optional[str] = None,
        hospital: Optional[str] = None,
        search: Optional[str] = None,
    ) -> List[DoctorOut]:
        results = self.doctors

        if hospital and hospital != "all":
            h_target = hospital.strip().lower()
            results = [
                d for d in results
                if any(
                    aff.hospital_id.lower() == h_target
                    or (aff.hospital_name and h_target in aff.hospital_name.lower())
                    for aff in d.hospitals
                )
            ]

        if city and city != "all":
            c_target = city.strip().lower()
            results = [
                d for d in results
                if (d.city and c_target in d.city.lower())
                or any(aff.hospital_city and c_target in aff.hospital_city.lower() for aff in d.hospitals)
            ]

        if speciality and speciality != "all":
            s_target = speciality.strip().lower()
            results = [d for d in results if d.speciality.lower() == s_target]

        if search:
            q = search.strip().lower()
            results = [
                d for d in results
                if q in d.name.lower()
                or q in d.department.lower()
                or q in d.speciality.lower()
                or (d.sub_speciality and q in d.sub_speciality.lower())
                or (d.city and q in d.city.lower())
                or (d.area and q in d.area.lower())
                or (d.summary and q in d.summary.lower())
            ]

        return results

    def get_doctor_by_slug_or_id(self, slug_or_id: str) -> Optional[DoctorOut]:
        return self.doctors_by_slug.get(slug_or_id) or self.doctors_by_id.get(slug_or_id)

    # ------------------ Laboratories Queries ------------------
    def get_laboratories(
        self,
        city: Optional[str] = None,
        search: Optional[str] = None,
    ) -> List[LaboratoryOut]:
        results = self.laboratories
        if city and city != "all":
            c = city.strip().lower()
            results = [l for l in results if c in l.city.lower()]
        if search:
            q = search.strip().lower()
            results = [
                l for l in results
                if q in l.name.lower()
                or q in l.area.lower()
                or q in l.address.lower()
                or (l.accreditation and q in l.accreditation.lower())
            ]
        return results

    def get_laboratory_by_slug_or_id(self, slug_or_id: str) -> Optional[LaboratoryOut]:
        return self.laboratories_by_slug.get(slug_or_id) or self.laboratories_by_id.get(slug_or_id)

    # ------------------ Wellness Queries ------------------
    def get_wellness_centers(
        self,
        city: Optional[str] = None,
        category: Optional[str] = None,
        search: Optional[str] = None,
    ) -> List[WellnessCenterOut]:
        results = self.wellness_centers
        if city and city != "all":
            c = city.strip().lower()
            results = [w for w in results if c in w.city.lower()]
        if category and category != "all":
            cat = category.strip().lower()
            results = [w for w in results if cat in w.category.lower()]
        if search:
            q = search.strip().lower()
            results = [
                w for w in results
                if q in w.name.lower()
                or q in w.area.lower()
                or q in w.address.lower()
                or q in w.category.lower()
                or (w.accreditation and q in w.accreditation.lower())
            ]
        return results

    def get_wellness_center_by_slug_or_id(self, slug_or_id: str) -> Optional[WellnessCenterOut]:
        return self.wellness_by_slug.get(slug_or_id) or self.wellness_by_id.get(slug_or_id)

directory_store = DirectoryStore()
