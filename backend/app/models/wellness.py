from sqlalchemy import Column, String, Text, DateTime, JSON
from sqlalchemy.sql import func
from app.db.postgres import Base

class WellnessCenter(Base):
    __tablename__ = "wellness_centers"

    id = Column(String(64), primary_key=True, index=True)
    slug = Column(String(128), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False, index=True)
    category = Column(String(150), nullable=False)
    state = Column(String(100), nullable=False)
    city = Column(String(100), nullable=False, index=True)
    area = Column(String(100), nullable=False)
    address = Column(Text, nullable=False)
    pincode = Column(String(20), nullable=False)
    accreditation = Column(String(150), nullable=True)
    overview = Column(Text, nullable=True)
    website = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    whatsapp = Column(String(50), nullable=True)
    maps_url = Column(Text, nullable=True)
    verification_status = Column(String(50), default="independently-checked")
    last_checked = Column(String(50), nullable=True)

    # Structured lists
    images = Column(JSON, default=list)
    programs = Column(JSON, default=list)
    disciplines = Column(JSON, default=list)
    facilities = Column(JSON, default=list)
    sources = Column(JSON, default=list)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    def __repr__(self) -> str:
        return f"<WellnessCenter {self.name} ({self.city})>"
