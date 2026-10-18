from sqlalchemy import Column, String, Integer, Text, DateTime, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.postgres import Base

class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(String(64), primary_key=True, index=True)
    slug = Column(String(128), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    department = Column(String(100), nullable=False)
    department_slug = Column(String(100), nullable=False, index=True)
    speciality = Column(String(100), nullable=False, index=True)
    speciality_slug = Column(String(100), nullable=False, index=True)
    sub_speciality = Column(String(255), nullable=True)
    qualifications = Column(String(255), nullable=False)
    experience_years = Column(Integer, nullable=True)
    photo = Column(Text, nullable=True)
    summary = Column(Text, nullable=True)

    # Geographic / City Relation
    city = Column(String(100), nullable=False, index=True)
    state = Column(String(100), nullable=False)
    area = Column(String(100), nullable=True)
    location = Column(String(255), nullable=True)

    # Contacts & Verification
    phone = Column(String(255), nullable=True)
    whatsapp = Column(String(255), nullable=True)
    verification_status = Column(Text, default="independently-checked")
    last_checked = Column(Text, nullable=True)

    # Structured JSON data
    languages = Column(JSON, default=list)
    areas_of_practice = Column(JSON, default=list)
    sources = Column(JSON, default=list)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relational link to hospital affiliations
    affiliations = relationship(
        "DoctorHospitalAffiliation",
        back_populates="doctor",
        cascade="all, delete-orphan",
        lazy="select",
    )

    def __repr__(self) -> str:
        return f"<Doctor {self.name} ({self.speciality}, {self.city})>"
