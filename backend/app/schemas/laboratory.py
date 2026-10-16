from typing import List, Optional, Any
from pydantic import BaseModel, ConfigDict

class LaboratoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    slug: str
    name: str
    state: str
    city: str
    area: str
    address: str
    pincode: str
    accreditation: Optional[str] = None
    overview: Optional[str] = None
    home_sample_collection: bool = True
    emergency_available_24x7: bool = False
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
