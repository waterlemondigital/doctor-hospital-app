from sqlalchemy import Column, String, Boolean, Integer, Text, DateTime, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.postgres import Base

class Hospital(Base):
    __tablename__ = "hospitals"

    id = Column(String(64), primary_key=True, index=True)
    slug = Column(String(128), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False, index=True)
    state = Column(String(100), nullable=False)
    city = Column(String(100), nullable=False, index=True)
    area = Column(String(100), nullable=False)
    address = Column(Text, nullable=False)
    pincode = Column(String(50), nullable=False)
    facility_type = Column(String(255), nullable=False)
    facility_type_badge = Column(String(255), nullable=False)
    overview = Column(Text, nullable=True)
    bed_count = Column(Integer, nullable=True)
    emergency_available_24x7 = Column(Boolean, default=True, nullable=False)
    website = Column(String(255), nullable=True)
    phone = Column(String(255), nullable=True)
    whatsapp = Column(String(255), nullable=True)
    maps_url = Column(Text, nullable=True)
    verification_status = Column(String(50), default="independently-checked")
    last_checked = Column(String(50), nullable=True)

    # Structured JSON attributes
    images = Column(JSON, default=list)
    services = Column(JSON, default=list)
    departments = Column(JSON, default=list)
    facilities = Column(JSON, default=list)
    sources = Column(JSON, default=list)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relational link to doctor affiliations
    affiliations = relationship(
        "DoctorHospitalAffiliation",
        back_populates="hospital",
        cascade="all, delete-orphan",
        lazy="select",
    )

    def __repr__(self) -> str:
        return f"<Hospital {self.name} ({self.city})>"
