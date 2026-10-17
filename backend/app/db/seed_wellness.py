"""
Seed Wellness Centers from data/17-10-1136/pune_wellness_centres_10_researched.md into PostgreSQL.
"""
import asyncio
from pathlib import Path
from sqlalchemy import delete, select
from app.db.postgres import engine, AsyncSessionLocal, Base
from app.models.wellness import WellnessCenter
from app.db.markdown_parser import parse_wellness_md
from app.core.cache import api_cache

ROOT_DIR = Path(__file__).resolve().parent.parent.parent.parent
WELLNESS_PATH = ROOT_DIR / "data/17-10-1136/pune_wellness_centres_10_researched.md"

async def seed_wellness():
    print(f"🌿 Reading wellness centers from: {WELLNESS_PATH.name}")
    centers = parse_wellness_md(WELLNESS_PATH)
    print(f"Parsed {len(centers)} wellness centers.")

    async with engine.begin() as conn:
        await conn.run_sync(WellnessCenter.__table__.drop, checkfirst=True)
        await conn.run_sync(WellnessCenter.__table__.create, checkfirst=True)

    async with AsyncSessionLocal() as session:
        print("💾 Inserting 10 verified wellness centers...")
        for c in centers:
            center = WellnessCenter(
                id=c["id"],
                slug=c["slug"],
                name=c["name"],
                category=c["category"],
                city=c["city"],
                area=c["area"],
                state=c["state"],
                address=c["address"],
                pincode=c["pincode"],
                accreditation=c["accreditation"],
                overview=c["overview"],
                phone=c["phone"],
                whatsapp=c["whatsapp"],
                website=c["website"],
                maps_url=c["maps_url"],
                programs=c["programs"],
                disciplines=c["disciplines"],
                facilities=c["facilities"],
                images=c.get("images", []),
                verification_status=c.get("verification_status", "Public official website reviewed; verify current details before publishing"),
                last_checked=c.get("last_checked", "2026-10-17"),
                sources=c.get("sources", []),
            )
            session.add(center)

        await session.commit()
        print("✅ Successfully seeded 10 wellness centers into PostgreSQL!")

    api_cache.clear()
    print("🧹 Cleared API in-memory cache.")

if __name__ == "__main__":
    asyncio.run(seed_wellness())
