from typing import List, Optional, Any
from pydantic import BaseModel, ConfigDict

class HospitalDoctorAffiliationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    doctor_id: str
    doctor_name: Optional[str] = None
    doctor_slug: Optional[str] = None
    speciality: Optional[str] = None
    days: str
    timings: str
    note: Optional[str] = None

class HospitalOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    slug: str
    name: str
    state: str
    city: str
    area: str
    address: str
    pincode: str
    facility_type: str
    facility_type_badge: str
    overview: Optional[str] = None
    bed_count: Optional[int] = None
    emergency_available_24x7: bool = True
    website: Optional[str] = None
    phone: Optional[str] = None
    whatsapp: Optional[str] = None
    maps_url: Optional[str] = None
    verification_status: str
    last_checked: Optional[str] = None
    images: List[Any] = []
    services: List[str] = []
    departments: List[Any] = []
    facilities: List[str] = []
    sources: List[Any] = []
    doctors: List[HospitalDoctorAffiliationOut] = []
