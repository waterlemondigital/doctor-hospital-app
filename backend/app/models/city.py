from sqlalchemy import Column, String, Boolean, Integer
from app.db.postgres import Base

class City(Base):
    __tablename__ = "cities"

    id = Column(String(50), primary_key=True, index=True)  # e.g. "pune", "mumbai"
    name = Column(String(100), nullable=False)
    state_id = Column(String(50), nullable=False)
    state_name = Column(String(100), nullable=False, default="Maharashtra")
    is_active = Column(Boolean, default=True, nullable=False)
    hospital_count = Column(Integer, default=0, nullable=False)

    def __repr__(self) -> str:
        return f"<City {self.name} ({self.id})>"
