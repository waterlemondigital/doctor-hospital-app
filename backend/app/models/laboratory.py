from sqlalchemy import Column, String, Boolean, Text, DateTime, JSON
from sqlalchemy.sql import func
from app.db.postgres import Base

class Laboratory(Base):
    __tablename__ = "laboratories"

    id = Column(String(64), primary_key=True, index=True)
    slug = Column(String(128), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False, index=True)
    state = Column(String(100), nullable=False)
    city = Column(String(100), nullable=False, index=True)
    area = Column(String(100), nullable=False)
    address = Column(Text, nullable=False)
    pincode = Column(String(50), nullable=False)
    accreditation = Column(String(255), nullable=True)
    overview = Column(Text, nullable=True)
    home_sample_collection = Column(Boolean, default=True, nullable=False)
    emergency_available_24x7 = Column(Boolean, default=False, nullable=False)
    website = Column(String(255), nullable=True)
    phone = Column(String(255), nullable=True)
    whatsapp = Column(String(255), nullable=True)
    maps_url = Column(Text, nullable=True)
    verification_status = Column(Text, default="independently-checked")
    last_checked = Column(Text, nullable=True)

    # Structured lists
    images = Column(JSON, default=list)
    services = Column(JSON, default=list)
    departments = Column(JSON, default=list)
    facilities = Column(JSON, default=list)
    sources = Column(JSON, default=list)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    def __repr__(self) -> str:
        return f"<Laboratory {self.name} ({self.city})>"
