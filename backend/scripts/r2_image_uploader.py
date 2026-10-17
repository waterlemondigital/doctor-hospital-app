#!/usr/bin/env python3
"""
CLI Tool for Uploading Facility & Doctor Images to Cloudflare R2
Strictly adheres to backend/R2_OPERATIONS_STRATEGY.md

Usage:
    python -m scripts.r2_image_uploader --dir "../data/images_hospitals/Sahyadri Super Speciality Hospital  " --type hospital
    python -m scripts.r2_image_uploader --dir "../data/images_hospitals" --type hospital
"""

import sys
import os
import re
import argparse
import asyncio
from pathlib import Path
from typing import List, Dict, Any, Optional

# Ensure backend root is on sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from sqlalchemy import select, update
from app.db.postgres import AsyncSessionLocal
from app.models.hospital import Hospital
from app.models.doctor import Doctor
from app.models.wellness import WellnessCenter
from app.models.laboratory import Laboratory
from app.models.image import Image
from app.core.r2 import upload_image_with_strategy, batch_upload_entity_images

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".avif", ".bmp"}


def normalize_name(name: str) -> str:
    """Normalize string for fuzzy lookup against facility names."""
    return re.sub(r"[^a-zA-Z0-9]", "", name).lower()


async def find_entity(session, entity_type: str, search_name: str) -> Optional[Any]:
    norm_search = normalize_name(search_name)
    
    if entity_type == "hospital":
        model = Hospital
    elif entity_type == "doctor":
        model = Doctor
    elif entity_type == "wellness":
        model = WellnessCenter
    elif entity_type == "laboratory":
        model = Laboratory
    else:
        raise ValueError(f"Unknown entity type: {entity_type}")

    # Direct name ILIKE search
    res = await session.execute(select(model).filter(model.name.ilike(f"%{search_name.strip()}%")))
    match = res.scalars().first()
    if match:
        return match

    # Search all entities by normalized name
    res_all = await session.execute(select(model))
    for obj in res_all.scalars().all():
        if norm_search in normalize_name(obj.name) or normalize_name(obj.name) in norm_search:
            return obj
        if hasattr(obj, "slug") and (norm_search in normalize_name(obj.slug) or normalize_name(obj.slug) in norm_search):
            return obj

    return None


async def process_facility_folder(session, folder_path: Path, entity_type: str, generate_variants: bool = True):
    facility_name = folder_path.name.strip()
    print(f"\n📂 Scanning facility folder: '{facility_name}' at {folder_path}")

    # 1. Match entity in DB
    entity = await find_entity(session, entity_type, facility_name)
    if not entity:
        print(f"⚠️  Could not find {entity_type} matching '{facility_name}' in database. Skipping.")
        return

    entity_id = entity.id
    entity_name = entity.name
    print(f"✅ Matched with {entity_type}: '{entity_name}' (ID: {entity_id})")

    # 2. Gather image files
    image_files = sorted(
        [p for p in folder_path.iterdir() if p.is_file() and p.suffix.lower() in IMAGE_EXTENSIONS]
    )

    if not image_files:
        print(f"⚠️  No valid images found in {folder_path}")
        return

    print(f"📸 Found {len(image_files)} images to process.")

    # 3. Process and upload via R2 Operations Strategy (zero duplicate ops, WebP variants, immutable headers)
    items = []
    for idx, img_path in enumerate(image_files):
        caption = f"Facility view {idx + 1}"
        alt = f"{entity_name} - View {idx + 1}"
        items.append({
            "source": img_path,
            "alt": alt,
            "caption": caption,
            "usage_permission_note": "Official facility asset",
        })

    uploaded_results = await batch_upload_entity_images(
        session=None,
        image_items=items,
        entity_type=entity_type,
        entity_id=entity_id,
        generate_variants=generate_variants,
    )

    print(f"✨ Successfully synchronized {len(uploaded_results)} images for {entity_name}.")

    # 4. Update facility's `images` JSON list for backwards compatibility & instant frontend rendering
    if entity_type == "hospital":
        model = Hospital
    elif entity_type == "doctor":
        model = Doctor
    elif entity_type == "wellness":
        model = WellnessCenter
    elif entity_type == "laboratory":
        model = Laboratory

    fresh_entity = await session.get(model, entity_id)
    if not fresh_entity:
        return

    if hasattr(fresh_entity, "images"):
        existing_images = fresh_entity.images or []
        existing_hashes = {img.get("content_hash") or img.get("url") for img in existing_images}
        
        merged_images = list(existing_images)
        for u in uploaded_results:
            key_id = u.get("content_hash") or u.get("url")
            if key_id not in existing_hashes:
                merged_images.append({
                    "url": u["url"],
                    "thumb_url": u["thumb_url"],
                    "card_url": u["card_url"],
                    "full_url": u["full_url"],
                    "alt": u["alt"],
                    "caption": u["caption"],
                    "content_hash": u["content_hash"],
                })
                existing_hashes.add(key_id)

        fresh_entity.images = merged_images
        await session.commit()
        print(f"💾 Updated {entity_type}.images column with {len(merged_images)} total image entries.")
    elif hasattr(fresh_entity, "photo") and uploaded_results:
        fresh_entity.photo = uploaded_results[0]["url"]
        await session.commit()
        print(f"💾 Updated doctor photo to {fresh_entity.photo}")


async def main():
    parser = argparse.ArgumentParser(description="Upload facility images to R2 following R2_OPERATIONS_STRATEGY.md")
    parser.add_argument("--dir", required=True, help="Directory containing images or subdirectories of images")
    parser.add_argument("--type", default="hospital", choices=["hospital", "doctor", "wellness", "laboratory"], help="Entity type")
    parser.add_argument("--no-variants", action="store_true", help="Only upload full size, skip thumb/card variants")

    args = parser.parse_args()
    target_path = Path(args.dir).resolve()

    if not target_path.exists():
        print(f"❌ Error: Path does not exist: {target_path}")
        sys.exit(1)

    async with AsyncSessionLocal() as session:
        # Check if the path contains direct image files or subdirectories
        has_direct_images = any(p.suffix.lower() in IMAGE_EXTENSIONS for p in target_path.iterdir() if p.is_file())

        if has_direct_images:
            # Single facility folder
            await process_facility_folder(
                session=session,
                folder_path=target_path,
                entity_type=args.type,
                generate_variants=not args.no_variants,
            )
        else:
            # Multiple facility folders inside directory
            subdirs = [p for p in target_path.iterdir() if p.is_dir() and not p.name.startswith(".")]
            print(f"Found {len(subdirs)} facility directories in {target_path}")
            for subdir in subdirs:
                await process_facility_folder(
                    session=session,
                    folder_path=subdir,
                    entity_type=args.type,
                    generate_variants=not args.no_variants,
                )

    print("\n🎉 All image operations completed adhering strictly to R2_OPERATIONS_STRATEGY.md!\n")


if __name__ == "__main__":
    asyncio.run(main())
