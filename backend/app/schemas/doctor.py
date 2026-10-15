from typing import List, Optional, Any
from pydantic import BaseModel, ConfigDict

class AffiliationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    hospital_id: str
    hospital_name: Optional[str] = None
    hospital_slug: Optional[str] = None
    hospital_city: Optional[str] = None
    days: str
    timings: str
    note: Optional[str] = None

class DoctorOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    slug: str
    name: str
    title: str
    department: str
    department_slug: str
    speciality: str
    speciality_slug: str
    sub_speciality: Optional[str] = None
    qualifications: str
    experience_years: Optional[int] = None
    photo: Optional[str] = None
    summary: Optional[str] = None
    city: str
    state: str
    area: Optional[str] = None
    location: Optional[str] = None
    phone: Optional[str] = None
    whatsapp: Optional[str] = None
    verification_status: str
    last_checked: Optional[str] = None
    languages: List[str] = []
    areas_of_practice: List[str] = []
    sources: List[Any] = []
    hospitals: List[AffiliationOut] = []
