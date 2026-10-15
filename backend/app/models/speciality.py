from sqlalchemy import Column, String, Text
from app.db.postgres import Base

class Speciality(Base):
    __tablename__ = "specialities"

    id = Column(String(50), primary_key=True, index=True)  # e.g. "cardiology"
    name = Column(String(100), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    icon_name = Column(String(50), nullable=True)

    def __repr__(self) -> str:
        return f"<Speciality {self.name}>"
