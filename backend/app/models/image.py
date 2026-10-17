from sqlalchemy import Column, String, Integer, Text, DateTime, Index
from sqlalchemy.sql import func
from app.db.postgres import Base

class Image(Base):
    """
    R2 Image Model: Strictly follows R2_OPERATIONS_STRATEGY.md.
    PostgreSQL is the single source of truth for object existence, metadata, and CDN URLs.
    Never query Cloudflare R2 (list_objects or head_object) for state or existence checks.
    """
    __tablename__ = "images"

    id = Column(String(64), primary_key=True, index=True)
    entity_type = Column(String(50), nullable=False, index=True)  # 'hospital', 'doctor', 'wellness', 'laboratory'
    entity_id = Column(String(64), nullable=False, index=True)
    object_key = Column(String(500), nullable=False)
    content_hash = Column(String(64), unique=True, index=True, nullable=False)  # SHA-256 hex digest of processed webp

    # Public CDN delivery URLs (direct CDN, no FastAPI proxying)
    url = Column(String(500), nullable=False)
    thumb_url = Column(String(500), nullable=True)  # 400w
    card_url = Column(String(500), nullable=True)   # 800w
    full_url = Column(String(500), nullable=True)   # 1600w

    width = Column(Integer, nullable=True)
    height = Column(Integer, nullable=True)
    size_bytes = Column(Integer, nullable=True)
    mime_type = Column(String(50), default="image/webp", nullable=False)

    alt_text = Column(String(255), nullable=True)
    caption = Column(String(255), nullable=True)
    usage_permission_note = Column(Text, nullable=True)
    sort_order = Column(Integer, default=0, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    __table_args__ = (
        Index("ix_images_entity_lookup", "entity_type", "entity_id", "sort_order"),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "entity_type": self.entity_type,
            "entity_id": self.entity_id,
            "object_key": self.object_key,
            "content_hash": self.content_hash,
            "url": self.url,
            "thumb_url": self.thumb_url or self.url,
            "card_url": self.card_url or self.url,
            "full_url": self.full_url or self.url,
            "width": self.width,
            "height": self.height,
            "size_bytes": self.size_bytes,
            "alt": self.alt_text or "",
            "alt_text": self.alt_text or "",
            "caption": self.caption or "",
            "usage_permission_note": self.usage_permission_note,
            "sort_order": self.sort_order,
        }

    def __repr__(self) -> str:
        return f"<Image {self.id} entity={self.entity_type}:{self.entity_id} hash={self.content_hash[:8]}>"
