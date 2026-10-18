#!/usr/bin/env python3
"""
Importer for MedVexa India Hospital Data
Parses data/medvexa_india_hospital_data_interconnected (1).md and populates PostgreSQL.
Preserves existing hospital images.
"""

import sys
import re
import asyncio
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from sqlalchemy import select, func
from app.db.postgres import AsyncSessionLocal, engine
from app.models.hospital import Hospital
from app.models.city import City
from app.db.markdown_parser import parse_hospitals_md

DATA_FILE = backend_dir.parent / "data" / "medvexa_india_hospital_data_interconnected (1).md"

def generate_unique_slug(base_slug: str, existing_slugs: set) -> str:
    slug = base_slug[:120]
    if slug not in existing_slugs:
        existing_slugs.add(slug)
        return slug
    idx = 2
    while f"{slug}-{idx}" in existing_slugs:
        idx += 1
    new_slug = f"{slug}-{idx}"
    existing_slugs.add(new_slug)
    return new_slug


async def import_india_hospitals():
    if not DATA_FILE.exists():
        print(f"❌ Error: File not found at {DATA_FILE}")
        sys.exit(1)

    print(f"📖 Parsing hospital records from: {DATA_FILE.name}")
    raw_hospitals = parse_hospitals_md(DATA_FILE)
    print(f"✅ Found {len(raw_hospitals)} hospital records to process.")

    async with AsyncSessionLocal() as session:
        # Load all existing hospitals
        res = await session.execute(select(Hospital))
        existing_hospitals = res.scalars().all()
        
        hosp_by_name = {h.name.lower().strip(): h for h in existing_hospitals}
        hosp_by_slug = {h.slug: h for h in existing_hospitals}
        hosp_by_id = {h.id: h for h in existing_hospitals}
        existing_slugs = set(h.slug for h in existing_hospitals)

        created_count = 0
        updated_count = 0

        for h in raw_hospitals:
            name = h["name"].strip()
            name_low = name.lower()
            base_slug = h["slug"]
            h_id = h["id"]

            # Match existing by ID, slug, or normalized name
            existing = hosp_by_id.get(h_id) or hosp_by_slug.get(base_slug) or hosp_by_name.get(name_low)

            if existing:
                # Update existing hospital, preserving its images
                existing.name = name
                existing.city = h["city"]
                existing.area = h["area"]
                existing.state = h["state"]
                existing.address = h["address"]
                existing.pincode = h["pincode"]
                existing.facility_type = h["facility_type"]
                existing.facility_type_badge = h["facility_type_badge"]
                existing.bed_count = h["bed_count"]
                existing.emergency_available_24x7 = h["emergency_available_24x7"]
                if h["phone"]:
                    existing.phone = h["phone"]
                if h["whatsapp"]:
                    existing.whatsapp = h["whatsapp"]
                if h["website"]:
                    existing.website = h["website"]
                if h["maps_url"]:
                    existing.maps_url = h["maps_url"]
                existing.overview = h["overview"]
                existing.services = h["services"]
                existing.departments = h["departments"]
                existing.facilities = h["facilities"]
                # Keep existing images if already present!
                if not existing.images and h["images"]:
                    existing.images = h["images"]
                updated_count += 1
            else:
                # Insert new hospital
                unique_slug = generate_unique_slug(base_slug, existing_slugs)
                new_hospital = Hospital(
                    id=h_id,
                    slug=unique_slug,
                    name=name,
                    city=h["city"],
                    area=h["area"],
                    state=h["state"],
                    address=h["address"],
                    pincode=h["pincode"],
                    facility_type=h["facility_type"],
                    facility_type_badge=h["facility_type_badge"],
                    bed_count=h["bed_count"],
                    emergency_available_24x7=h["emergency_available_24x7"],
                    phone=h["phone"] or "+91 78756 57402",
                    whatsapp=h["whatsapp"] or "+91 78756 57402",
                    website=h["website"],
                    maps_url=h["maps_url"],
                    overview=h["overview"],
                    services=h["services"],
                    departments=h["departments"],
                    facilities=h["facilities"],
                    images=h["images"] or [],
                )
                session.add(new_hospital)
                hosp_by_id[h_id] = new_hospital
                hosp_by_slug[unique_slug] = new_hospital
                hosp_by_name[name_low] = new_hospital
                created_count += 1

        await session.commit()
        print(f"💾 Database update complete: {created_count} created, {updated_count} updated.")

        # Update / Insert City entries for all cities
        all_hosps = (await session.execute(select(Hospital))).scalars().all()
        city_counts = {}
        city_states = {}
        for hosp in all_hosps:
            c = (hosp.city or "").strip().lower()
            if c:
                city_counts[c] = city_counts.get(c, 0) + 1
                city_states[c] = hosp.state

        for city_id, count in city_counts.items():
            city_rec = (await session.execute(select(City).where(City.id == city_id))).scalar_one_or_none()
            if city_rec:
                city_rec.hospital_count = count
                city_rec.is_active = True
            else:
                formatted_name = city_id.replace("-", " ").title()
                state_name = city_states.get(city_id, "India")
                new_city = City(
                    id=city_id,
                    name=formatted_name,
                    state_id=re.sub(r"[^a-z0-9]+", "-", state_name.lower()).strip("-"),
                    state_name=state_name,
                    is_active=True,
                    hospital_count=count,
                )
                session.add(new_city)

        await session.commit()
        print(f"🏙️  Updated city directory records for {len(city_counts)} cities.")

        total_hosps = len(all_hosps)
        print(f"🎉 Total hospitals in database now: {total_hosps}")


if __name__ == "__main__":
    asyncio.run(import_india_hospitals())
