from sqlalchemy import Column, Integer, String, Text, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.db.postgres import Base

class DoctorHospitalAffiliation(Base):
    __tablename__ = "doctor_hospital_affiliations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    doctor_id = Column(String(64), ForeignKey("doctors.id", ondelete="CASCADE"), nullable=False, index=True)
    hospital_id = Column(String(64), ForeignKey("hospitals.id", ondelete="CASCADE"), nullable=False, index=True)
    days = Column(String(255), nullable=False)
    timings = Column(String(255), nullable=False)
    note = Column(Text, nullable=True)

    # Relationships
    doctor = relationship("Doctor", back_populates="affiliations", lazy="select")
    hospital = relationship("Hospital", back_populates="affiliations", lazy="select")

    __table_args__ = (
        UniqueConstraint("doctor_id", "hospital_id", name="uq_doctor_hospital"),
    )

    def __repr__(self) -> str:
        return f"<Affiliation Doctor:{self.doctor_id} <-> Hospital:{self.hospital_id}>"


class HospitalLaboratoryAffiliation(Base):
    __tablename__ = "hospital_laboratory_affiliations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    hospital_id = Column(String(64), ForeignKey("hospitals.id", ondelete="CASCADE"), nullable=False, index=True)
    laboratory_id = Column(String(64), ForeignKey("laboratories.id", ondelete="CASCADE"), nullable=False, index=True)

    __table_args__ = (
        UniqueConstraint("hospital_id", "laboratory_id", name="uq_hospital_laboratory"),
    )

    def __repr__(self) -> str:
        return f"<Affiliation Hospital:{self.hospital_id} <-> Laboratory:{self.laboratory_id}>"


class DoctorLaboratoryAffiliation(Base):
    __tablename__ = "doctor_laboratory_affiliations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    doctor_id = Column(String(64), ForeignKey("doctors.id", ondelete="CASCADE"), nullable=False, index=True)
    laboratory_id = Column(String(64), ForeignKey("laboratories.id", ondelete="CASCADE"), nullable=False, index=True)

    __table_args__ = (
        UniqueConstraint("doctor_id", "laboratory_id", name="uq_doctor_laboratory"),
    )

    def __repr__(self) -> str:
        return f"<Affiliation Doctor:{self.doctor_id} <-> Laboratory:{self.laboratory_id}>"

