"""
Database Importer for Markdown Healthcare Directory Data.
Reads:
  - hospitals.md (or data/hospitals.md)
  - doctors.md (or data/doctors.md)
  - laboratories.md (or data/laboratories.md)
  - wellness.md (or data/wellness.md)

Populates Neon PostgreSQL database with relational models and linkages.
"""
import asyncio
from pathlib import Path
from sqlalchemy.future import select
from sqlalchemy import delete
from app.db.postgres import engine, AsyncSessionLocal, Base
from app.models.hospital import Hospital
from app.models.doctor import Doctor
from app.models.laboratory import Laboratory
from app.models.wellness import WellnessCenter
from app.models.affiliation import (
    DoctorHospitalAffiliation,
    HospitalLaboratoryAffiliation,
    DoctorLaboratoryAffiliation,
)
from app.models.city import City
from app.models.speciality import Speciality
from app.db.markdown_parser import (
    parse_hospitals_md,
    parse_doctors_md,
    parse_laboratories_md,
    parse_wellness_md,
)

def find_file(filenames: list[str]) -> Path | None:
    for name in filenames:
        for p in [Path(name), Path(f"../{name}"), Path(f"data/{name}"), Path(f"../data/{name}")]:
            if p.exists():
                return p
    return None

async def import_data(
    hospitals_path: Path | None = None,
    doctors_path: Path | None = None,
    laboratories_path: Path | None = None,
    wellness_path: Path | None = None,
    clear_existing_doctors: bool = False,
    clear_existing_laboratories: bool = False,
):
    print("🚀 Initializing Neon Database Schema for Directory Data...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Resolve paths if not explicitly provided
    h_file = hospitals_path or find_file(["17-10-1259/pune_hospital_data_interconnected.md", "pune_hospital_data_interconnected.md", "hospitals.md", "templates/hospitals.template.md", "data/templates/hospitals.template.md"])
    d_file = doctors_path or find_file(["17-10-1259/pune_doctor_data_interconnected.md", "pune_doctor_data_interconnected.md", "doctors.md", "templates/doctors.template.md", "data/templates/doctors.template.md"])
    l_file = laboratories_path or find_file(["17-10-1259/pune_laboratories_10_canonical_names.md", "pune_laboratories_10_canonical_names.md", "laboratories.md", "templates/laboratories.template.md", "data/templates/laboratories.template.md"])
    w_file = wellness_path or find_file(["wellness.md", "templates/wellness.template.md", "data/templates/wellness.template.md"])

    hosps_data = parse_hospitals_md(h_file) if h_file else []
    docs_data = parse_doctors_md(d_file) if d_file else []
    labs_data = parse_laboratories_md(l_file) if l_file else []
    wells_data = parse_wellness_md(w_file) if w_file else []

    print(f"📖 Files loaded:")
    print(f"  - Hospitals:    {h_file} ({len(hosps_data)} records)")
    print(f"  - Doctors:      {d_file} ({len(docs_data)} records)")
    print(f"  - Laboratories: {l_file} ({len(labs_data)} records)")
    print(f"  - Wellness:     {w_file} ({len(wells_data)} records)")

    async with AsyncSessionLocal() as session:
        if clear_existing_doctors:
            print("🧹 Clearing previous doctors and doctor affiliations...")
            await session.execute(delete(DoctorHospitalAffiliation))
            await session.execute(delete(DoctorLaboratoryAffiliation))
            await session.execute(delete(Doctor))
            await session.flush()

        if clear_existing_laboratories:
            print("🧹 Clearing previous laboratories and laboratory affiliations...")
            await session.execute(delete(HospitalLaboratoryAffiliation))
            await session.execute(delete(DoctorLaboratoryAffiliation))
            await session.execute(delete(Laboratory))
            await session.flush()

        seen_cities = set()
        existing_city_ids = {c.id for c in (await session.execute(select(City))).scalars().all()}
        seen_cities.update(existing_city_ids)

        seen_specialities = set()
        existing_spec_ids = {s.id for s in (await session.execute(select(Speciality))).scalars().all()}
        seen_specialities.update(existing_spec_ids)

        def add_city_if_needed(c_name: str):
            if not c_name:
                return
            c_id = c_name.strip().lower()
            if c_id not in seen_cities:
                seen_cities.add(c_id)
                session.add(City(id=c_id, name=c_name.strip().capitalize(), state_id="maharashtra"))

        def add_spec_if_needed(s_name: str, s_slug: str):
            if not s_slug:
                return
            if s_slug not in seen_specialities:
                seen_specialities.add(s_slug)
                session.add(Speciality(id=s_slug, name=s_name))

        # Track inserted entity IDs
        hosp_ids = set()
        doc_ids = set()
        lab_ids = set()

        # 1. Insert/Update Hospitals
        for h in hosps_data:
            q = select(Hospital).where((Hospital.id == h["id"]) | (Hospital.slug == h["slug"]))
            res = await session.execute(q)
            existing = res.scalar_one_or_none()
            if existing:
                h["id"] = existing.id
                for k in ["name", "slug", "city", "area", "state", "address", "pincode",
                          "facility_type", "facility_type_badge", "bed_count", "emergency_available_24x7",
                          "phone", "whatsapp", "website", "maps_url", "overview", "services",
                          "departments", "facilities"]:
                    setattr(existing, k, h[k])
            else:
                hospital = Hospital(
                    id=h["id"],
                    slug=h["slug"],
                    name=h["name"],
                    city=h["city"],
                    area=h["area"],
                    state=h["state"],
                    address=h["address"],
                    pincode=h["pincode"],
                    facility_type=h["facility_type"],
                    facility_type_badge=h["facility_type_badge"],
                    bed_count=h["bed_count"],
                    emergency_available_24x7=h["emergency_available_24x7"],
                    phone=h["phone"],
                    whatsapp=h["whatsapp"],
                    website=h["website"],
                    maps_url=h["maps_url"],
                    overview=h["overview"],
                    services=h["services"],
                    departments=h["departments"],
                    facilities=h["facilities"],
                    images=[],
                )
                session.add(hospital)
            hosp_ids.add(h["id"])
            add_city_if_needed(h.get("city", ""))

        # 2. Insert/Update Laboratories
        for l in labs_data:
            q = select(Laboratory).where((Laboratory.id == l["id"]) | (Laboratory.slug == l["slug"]))
            res = await session.execute(q)
            existing = res.scalar_one_or_none()
            if existing:
                l["id"] = existing.id
                for k in ["name", "slug", "city", "area", "state", "address", "pincode",
                          "accreditation", "overview", "home_sample_collection", "emergency_available_24x7",
                          "phone", "whatsapp", "website", "maps_url", "services", "departments",
                          "facilities", "verification_status", "last_checked", "sources"]:
                    if k in l:
                        setattr(existing, k, l[k])
            else:
                lab = Laboratory(
                    id=l["id"],
                    slug=l["slug"],
                    name=l["name"],
                    city=l["city"],
                    area=l["area"],
                    state=l["state"],
                    address=l["address"],
                    pincode=l["pincode"],
                    accreditation=l["accreditation"],
                    overview=l["overview"],
                    home_sample_collection=l["home_sample_collection"],
                    emergency_available_24x7=l["emergency_available_24x7"],
                    phone=l["phone"],
                    whatsapp=l["whatsapp"],
                    website=l["website"],
                    maps_url=l["maps_url"],
                    services=l["services"],
                    departments=l["departments"],
                    facilities=l["facilities"],
                    images=[],
                    verification_status=l.get("verification_status", "Provider information reviewed; verify details before production import"),
                    last_checked=l.get("last_checked", "2026-10-17"),
                    sources=l.get("sources", []),
                )
                session.add(lab)
            lab_ids.add(l["id"])
            add_city_if_needed(l.get("city", ""))

        # 3. Insert/Update Doctors
        for d in docs_data:
            q = select(Doctor).where((Doctor.id == d["id"]) | (Doctor.slug == d["slug"]))
            res = await session.execute(q)
            existing = res.scalar_one_or_none()
            if existing:
                d["id"] = existing.id
                for k in ["name", "slug", "title", "department", "department_slug", "speciality",
                          "speciality_slug", "sub_speciality", "qualifications", "experience_years",
                          "languages", "city", "area", "state", "phone", "whatsapp",
                          "summary", "areas_of_practice", "verification_status", "last_checked", "sources"]:
                    if k in d:
                        setattr(existing, k, d[k])
            else:
                doctor = Doctor(
                    id=d["id"],
                    slug=d["slug"],
                    name=d["name"],
                    title=d["title"],
                    department=d["department"],
                    department_slug=d["department_slug"],
                    speciality=d["speciality"],
                    speciality_slug=d["speciality_slug"],
                    sub_speciality=d["sub_speciality"],
                    qualifications=d["qualifications"],
                    experience_years=d["experience_years"],
                    languages=d["languages"],
                    city=d["city"],
                    area=d["area"],
                    state=d["state"],
                    phone=d["phone"],
                    whatsapp=d["whatsapp"],
                    photo=d.get("photo", ""),
                    summary=d["summary"],
                    areas_of_practice=d["areas_of_practice"],
                    verification_status=d.get("verification_status", "Hospital affiliation supported by official hospital directory/profile"),
                    last_checked=d.get("last_checked", "2026-10-17"),
                    sources=d.get("sources", []),
                )
                session.add(doctor)
            doc_ids.add(d["id"])
            add_city_if_needed(d.get("city", ""))
            add_spec_if_needed(d.get("speciality", ""), d.get("speciality_slug", ""))

        # 4. Insert/Update Wellness Centers (Standalone)
        for w in wells_data:
            q = select(WellnessCenter).where((WellnessCenter.id == w["id"]) | (WellnessCenter.slug == w["slug"]))
            res = await session.execute(q)
            existing = res.scalar_one_or_none()
            if existing:
                w["id"] = existing.id
                for k in ["name", "slug", "category", "city", "area", "state", "address",
                          "pincode", "accreditation", "overview", "phone", "whatsapp", "website",
                          "maps_url", "programs", "disciplines", "facilities"]:
                    setattr(existing, k, w[k])
            else:
                center = WellnessCenter(
                    id=w["id"],
                    slug=w["slug"],
                    name=w["name"],
                    category=w["category"],
                    city=w["city"],
                    area=w["area"],
                    state=w["state"],
                    address=w["address"],
                    pincode=w["pincode"],
                    accreditation=w["accreditation"],
                    overview=w["overview"],
                    phone=w["phone"],
                    whatsapp=w["whatsapp"],
                    website=w["website"],
                    maps_url=w["maps_url"],
                    programs=w["programs"],
                    disciplines=w["disciplines"],
                    facilities=w["facilities"],
                    images=[],
                )
                session.add(center)
            add_city_if_needed(w.get("city", ""))

        # Build lookup maps for resolving relations by Name, Slug, or ID (including existing DB records)
        hosp_lookup = {}
        db_hosps = (await session.execute(select(Hospital.id, Hospital.slug, Hospital.name))).all()
        for h_id, h_slug, h_name in db_hosps:
            hosp_lookup[h_id.lower()] = h_id
            if h_slug:
                hosp_lookup[h_slug.lower()] = h_id
            if h_name:
                hosp_lookup[h_name.lower()] = h_id
        for h in hosps_data:
            hosp_lookup[h["id"].lower()] = h["id"]
            hosp_lookup[h["slug"].lower()] = h["id"]
            hosp_lookup[h["name"].lower()] = h["id"]

        doc_lookup = {}
        db_docs = (await session.execute(select(Doctor.id, Doctor.slug, Doctor.name))).all()
        for d_id, d_slug, d_name in db_docs:
            doc_lookup[d_id.lower()] = d_id
            if d_slug:
                doc_lookup[d_slug.lower()] = d_id
            if d_name:
                doc_lookup[d_name.lower()] = d_id
        for d in docs_data:
            doc_lookup[d["id"].lower()] = d["id"]
            doc_lookup[d["slug"].lower()] = d["id"]
            doc_lookup[d["name"].lower()] = d["id"]

        lab_lookup = {}
        db_labs = (await session.execute(select(Laboratory.id, Laboratory.slug, Laboratory.name))).all()
        for l_id, l_slug, l_name in db_labs:
            lab_lookup[l_id.lower()] = l_id
            if l_slug:
                lab_lookup[l_slug.lower()] = l_id
            if l_name:
                lab_lookup[l_name.lower()] = l_id
        for l in labs_data:
            lab_lookup[l["id"].lower()] = l["id"]
            lab_lookup[l["slug"].lower()] = l["id"]
            lab_lookup[l["name"].lower()] = l["id"]

        def resolve_hosp(ref: str) -> str | None:
            c = ref.strip().lower()
            if not c or any(neg in c for neg in ["no formal", "not populated", "not specified", "verify official"]):
                return None
            c_norm = c.replace("&", "and").replace("-", " ")
            if c in hosp_lookup:
                return hosp_lookup[c]
            for k, v in hosp_lookup.items():
                k_norm = k.replace("&", "and").replace("-", " ")
                if c_norm in k_norm or k_norm in c_norm:
                    return v
            return None

        def resolve_doc(ref: str) -> str | None:
            c = ref.strip().lower()
            if not c or any(neg in c for neg in ["no formal", "not populated", "not specified"]):
                return None
            if c in doc_lookup:
                return doc_lookup[c]
            for k, v in doc_lookup.items():
                if c in k or k in c:
                    return v
            return None

        def resolve_lab(ref: str) -> str | None:
            c = ref.strip().lower()
            if not c or any(neg in c for neg in ["no formal", "not populated", "not specified", "verify official"]):
                return None
            c_norm = c.replace("&", "and").replace("-", " ")
            if c in lab_lookup:
                return lab_lookup[c]
            for k, v in lab_lookup.items():
                k_norm = k.replace("&", "and").replace("-", " ")
                if c_norm in k_norm or k_norm in c_norm:
                    return v
            return None

        # 5. Build Relations: Doctor <-> Hospital Affiliations
        affil_count = 0
        seen_doc_hosp = set()

        for d in docs_data:
            d_id = d["id"]
            for aff in d.get("hospital_affiliations", []):
                ref = aff.get("hospital_name_or_id") or aff.get("hospital_id", "")
                h_id = resolve_hosp(ref)
                if not h_id:
                    continue

                pair = (d_id, h_id)
                if pair in seen_doc_hosp:
                    continue
                seen_doc_hosp.add(pair)

                q = select(DoctorHospitalAffiliation).where(
                    DoctorHospitalAffiliation.doctor_id == d_id,
                    DoctorHospitalAffiliation.hospital_id == h_id,
                )
                res = await session.execute(q)
                existing_aff = res.scalar_one_or_none()
                if existing_aff:
                    existing_aff.days = aff.get("days", "Mon - Sat")
                    existing_aff.timings = aff.get("timings", "Regular Hours")
                    existing_aff.note = aff.get("note", "")
                else:
                    session.add(DoctorHospitalAffiliation(
                        doctor_id=d_id,
                        hospital_id=h_id,
                        days=aff.get("days", "Mon - Sat"),
                        timings=aff.get("timings", "Regular Hours"),
                        note=aff.get("note", ""),
                    ))
                affil_count += 1

        # Also link any hospitals that listed connected doctors
        for h in hosps_data:
            h_id = h["id"]
            for doc_ref in h.get("connected_doctors", []):
                d_id = resolve_doc(doc_ref)
                if not d_id:
                    continue

                pair = (d_id, h_id)
                if pair in seen_doc_hosp:
                    continue
                seen_doc_hosp.add(pair)

                q = select(DoctorHospitalAffiliation).where(
                    DoctorHospitalAffiliation.doctor_id == d_id,
                    DoctorHospitalAffiliation.hospital_id == h_id,
                )
                res = await session.execute(q)
                if not res.scalar_one_or_none():
                    session.add(DoctorHospitalAffiliation(
                        doctor_id=d_id,
                        hospital_id=h_id,
                        days="Mon - Sat",
                        timings="Consultation by appointment",
                        note="Hospital visiting consultant",
                    ))
                    affil_count += 1

        await session.flush()

        # 6. Build Relations: Hospital <-> Laboratory Affiliations
        hosp_lab_count = 0
        seen_hosp_lab = set()

        for h in hosps_data:
            h_id = h["id"]
            for lab_ref in h.get("connected_laboratories", []):
                l_id = resolve_lab(lab_ref)
                if not l_id:
                    continue

                pair = (h_id, l_id)
                if pair in seen_hosp_lab:
                    continue
                seen_hosp_lab.add(pair)

                q = select(HospitalLaboratoryAffiliation).where(
                    HospitalLaboratoryAffiliation.hospital_id == h_id,
                    HospitalLaboratoryAffiliation.laboratory_id == l_id,
                )
                res = await session.execute(q)
                if not res.scalar_one_or_none():
                    session.add(HospitalLaboratoryAffiliation(
                        hospital_id=h_id,
                        laboratory_id=l_id,
                    ))
                    hosp_lab_count += 1

        for l in labs_data:
            l_id = l["id"]
            for hosp_ref in l.get("connected_hospitals", []):
                h_id = resolve_hosp(hosp_ref)
                if not h_id:
                    continue

                pair = (h_id, l_id)
                if pair in seen_hosp_lab:
                    continue
                seen_hosp_lab.add(pair)

                q = select(HospitalLaboratoryAffiliation).where(
                    HospitalLaboratoryAffiliation.hospital_id == h_id,
                    HospitalLaboratoryAffiliation.laboratory_id == l_id,
                )
                res = await session.execute(q)
                if not res.scalar_one_or_none():
                    session.add(HospitalLaboratoryAffiliation(
                        hospital_id=h_id,
                        laboratory_id=l_id,
                    ))
                    hosp_lab_count += 1

        await session.flush()

        # 7. Build Relations: Doctor <-> Laboratory Affiliations
        doc_lab_count = 0
        seen_doc_lab = set()

        for d in docs_data:
            d_id = d["id"]
            for lab_ref in d.get("connected_laboratories", []):
                l_id = resolve_lab(lab_ref)
                if not l_id:
                    continue

                pair = (d_id, l_id)
                if pair in seen_doc_lab:
                    continue
                seen_doc_lab.add(pair)

                q = select(DoctorLaboratoryAffiliation).where(
                    DoctorLaboratoryAffiliation.doctor_id == d_id,
                    DoctorLaboratoryAffiliation.laboratory_id == l_id,
                )
                res = await session.execute(q)
                if not res.scalar_one_or_none():
                    session.add(DoctorLaboratoryAffiliation(
                        doctor_id=d_id,
                        laboratory_id=l_id,
                    ))
                    doc_lab_count += 1

        for l in labs_data:
            l_id = l["id"]
            for doc_ref in l.get("connected_doctors", []):
                d_id = resolve_doc(doc_ref)
                if not d_id:
                    continue

                pair = (d_id, l_id)
                if pair in seen_doc_lab:
                    continue
                seen_doc_lab.add(pair)

                q = select(DoctorLaboratoryAffiliation).where(
                    DoctorLaboratoryAffiliation.doctor_id == d_id,
                    DoctorLaboratoryAffiliation.laboratory_id == l_id,
                )
                res = await session.execute(q)
                if not res.scalar_one_or_none():
                    session.add(DoctorLaboratoryAffiliation(
                        doctor_id=d_id,
                        laboratory_id=l_id,
                    ))
                    doc_lab_count += 1

        await session.commit()

        print("\n✅ Neon PostgreSQL Database Sync Completed Successfully!")
        print(f"  • Hospitals:                         {len(hosps_data)}")
        print(f"  • Doctors:                           {len(docs_data)}")
        print(f"  • Laboratories:                      {len(labs_data)}")
        print(f"  • Wellness Centers:                  {len(wells_data)}")
        print(f"  • Doctor-Hospital Affiliations:      {affil_count}")
        print(f"  • Hospital-Laboratory Links:         {hosp_lab_count}")
        print(f"  • Doctor-Laboratory Links:           {doc_lab_count}")

if __name__ == "__main__":
    import sys
    clear_docs = "--keep-doctors" not in sys.argv
    clear_labs = "--keep-labs" not in sys.argv
    asyncio.run(import_data(clear_existing_doctors=clear_docs, clear_existing_laboratories=clear_labs))
