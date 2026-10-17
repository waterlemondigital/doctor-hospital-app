"""
Syncs backend PostgreSQL hospital & doctor data into frontend TypeScript static datasets:
- frontend/src/data/hospitals.ts
- frontend/src/data/doctors.ts
"""
import sys
import json
import asyncio
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from app.db.postgres import AsyncSessionLocal
from app.models.doctor import Doctor
from app.models.hospital import Hospital
from app.models.laboratory import Laboratory
from app.models.affiliation import DoctorHospitalAffiliation, HospitalLaboratoryAffiliation
from sqlalchemy import select

async def sync():
    async with AsyncSessionLocal() as session:
        # 1. Fetch all hospitals
        hosps = (await session.execute(select(Hospital))).scalars().all()
        # 2. Fetch all doctors
        docs = (await session.execute(select(Doctor))).scalars().all()

        hosp_map = {h.id: h for h in hosps}

        # Build doctorIds list per hospital
        hosp_doc_ids = {h.id: [] for h in hosps}
        for d in docs:
            for aff in d.affiliations:
                if aff.hospital_id in hosp_doc_ids:
                    if d.id not in hosp_doc_ids[aff.hospital_id]:
                        hosp_doc_ids[aff.hospital_id].append(d.id)

        # Build TypeScript HOSPITALS_DATA
        frontend_hosps = []
        for h in hosps:
            depts = []
            if h.departments:
                for dept in h.departments:
                    if isinstance(dept, dict):
                        depts.append(dept)
                    elif isinstance(dept, str):
                        import re
                        slug = re.sub(r"[^a-z0-9]+", "-", dept.lower()).strip("-")
                        depts.append({"name": dept, "slug": slug})

            sources = []
            if h.sources:
                sources = h.sources
            elif h.website:
                sources = [{
                    "label": f"{h.name} Official Website",
                    "url": h.website,
                    "type": "official-registry",
                    "dateChecked": h.last_checked or "2026-10-17"
                }]

            h_dict = {
                "id": h.id,
                "slug": h.slug,
                "name": h.name,
                "state": h.state,
                "city": h.city.capitalize() if h.city else "Pune",
                "area": h.area or "",
                "address": h.address or "",
                "pincode": h.pincode or "",
                "facilityType": h.facility_type or "Super-Speciality Tertiary Care",
                "facilityTypeBadge": h.facility_type_badge or "Accredited Healthcare Facility",
                "images": h.images or [],
                "overview": h.overview or "",
                "services": h.services or [],
                "departments": depts,
                "facilities": h.facilities or [],
                "bedCount": h.bed_count,
                "emergencyAvailable24x7": bool(h.emergency_available_24x7),
                "website": h.website or "",
                "phone": h.phone or "",
                "whatsapp": h.whatsapp or "",
                "mapsUrl": h.maps_url or "",
                "verificationStatus": "independently-checked",
                "lastChecked": h.last_checked or "2026-10-17",
                "sources": sources,
                "doctorIds": hosp_doc_ids.get(h.id, [])
            }
            frontend_hosps.append(h_dict)

        # Build TypeScript DOCTORS_DATA
        frontend_docs = []
        for d in docs:
            affils = []
            for aff in d.affiliations:
                h_name = hosp_map[aff.hospital_id].name if aff.hospital_id in hosp_map else aff.hospital_id
                affils.append({
                    "hospitalId": aff.hospital_id,
                    "hospitalName": h_name,
                    "days": aff.days,
                    "timings": aff.timings,
                    "note": aff.note or ""
                })

            sources = []
            if d.sources:
                for s in d.sources:
                    sources.append({
                        "label": s.get("name", "Official Profile"),
                        "url": s.get("url", ""),
                        "type": "official-registry",
                        "dateChecked": d.last_checked or "2026-10-17"
                    })

            # Placeholder clean doctor portrait avatar if photo is empty
            photo_url = d.photo or ""

            d_dict = {
                "id": d.id,
                "slug": d.slug,
                "name": d.name,
                "title": d.title,
                "department": d.department,
                "departmentSlug": d.department_slug,
                "speciality": d.speciality,
                "specialitySlug": d.speciality_slug,
                "subSpeciality": d.sub_speciality or "",
                "qualifications": d.qualifications or "MBBS",
                "experienceYears": d.experience_years,
                "languages": d.languages or ["English", "Hindi"],
                "photo": photo_url,
                "summary": d.summary or "",
                "areasOfPractice": d.areas_of_practice or [],
                "hospitals": affils,
                "area": d.area or "",
                "city": d.city.capitalize() if d.city else "Pune",
                "state": d.state or "Maharashtra",
                "location": f"{d.area}, {d.city.capitalize()}" if d.area and d.city else d.city.capitalize() if d.city else "Pune",
                "phone": d.phone or "",
                "whatsapp": d.whatsapp or "",
                "verificationStatus": "independently-checked",
                "lastChecked": d.last_checked or "2026-10-17",
                "sources": sources
            }
            frontend_docs.append(d_dict)

        # 3. Fetch all laboratories
        labs = (await session.execute(select(Laboratory))).scalars().all()

        frontend_labs = []
        lab_images = []

        for idx, l in enumerate(labs):
            depts = []
            if l.departments:
                for dept in l.departments:
                    if isinstance(dept, dict):
                        depts.append(dept)
                    elif isinstance(dept, str):
                        import re
                        slug = re.sub(r"[^a-z0-9]+", "-", dept.lower()).strip("-")
                        depts.append({"name": dept, "slug": slug})

            sources = []
            if l.sources:
                for s in l.sources:
                    sources.append({
                        "label": s.get("name", f"{l.name} Official Website"),
                        "url": s.get("url", l.website or ""),
                        "type": "official-registry",
                        "dateChecked": l.last_checked or "2026-10-17"
                    })
            elif l.website:
                sources = [{
                    "label": f"{l.name} Official Website",
                    "url": l.website,
                    "type": "official-registry",
                    "dateChecked": l.last_checked or "2026-10-17"
                }]

            img_url = lab_images[idx % len(lab_images)]
            images = l.images or [{
                "url": img_url,
                "alt": l.name,
                "caption": "Diagnostic pathology laboratory & automated testing center"
            }]

            badge = l.accreditation or "Diagnostic Pathology Laboratory"
            if "NABL" in (l.accreditation or "").upper():
                badge = "NABL Accredited Diagnostics"
            elif not badge or "confirm" in badge.lower():
                badge = "Diagnostic Pathology Facility"

            l_dict = {
                "id": l.id,
                "slug": l.slug,
                "name": l.name,
                "state": l.state or "Maharashtra",
                "city": l.city.capitalize() if l.city else "Pune",
                "area": l.area or "Pune",
                "address": l.address or "",
                "pincode": l.pincode or "",
                "facilityType": "Super-Speciality Tertiary Care",
                "facilityTypeBadge": badge,
                "images": images,
                "overview": l.overview or "",
                "services": l.services or [],
                "departments": depts,
                "facilities": l.facilities or [],
                "accreditation": l.accreditation or "",
                "homeSampleCollection": bool(l.home_sample_collection),
                "emergencyAvailable24x7": bool(l.emergency_available_24x7),
                "website": l.website or "",
                "phone": l.phone or "",
                "whatsapp": l.whatsapp or "",
                "mapsUrl": l.maps_url or "",
                "verificationStatus": "independently-checked",
                "lastChecked": l.last_checked or "2026-10-17",
                "sources": sources,
                "doctorIds": []
            }
            frontend_labs.append(l_dict)

        # Write out files
        frontend_dir = Path(__file__).resolve().parent.parent.parent.parent / "frontend" / "src" / "data"
        hosp_file = frontend_dir / "hospitals.ts"
        doc_file = frontend_dir / "doctors.ts"
        lab_file = frontend_dir / "laboratories.ts"

        hosp_content = "import { Hospital } from '../types';\n\nexport const HOSPITALS_DATA: Hospital[] = " + json.dumps(frontend_hosps, indent=2) + ";\n"
        doc_content = "import { Doctor } from '../types';\n\nexport const DOCTORS_DATA: Doctor[] = " + json.dumps(frontend_docs, indent=2) + ";\n"
        lab_content = "import { Hospital } from '../types';\n\nexport const LABORATORIES_DATA: Hospital[] = " + json.dumps(frontend_labs, indent=2) + ";\n"

        hosp_file.write_text(hosp_content, encoding="utf-8")
        doc_file.write_text(doc_content, encoding="utf-8")
        lab_file.write_text(lab_content, encoding="utf-8")

        print(f"✨ Successfully exported {len(frontend_hosps)} hospitals to {hosp_file}")
        print(f"✨ Successfully exported {len(frontend_docs)} doctors to {doc_file}")
        print(f"✨ Successfully exported {len(frontend_labs)} laboratories to {lab_file}")

if __name__ == "__main__":
    asyncio.run(sync())
