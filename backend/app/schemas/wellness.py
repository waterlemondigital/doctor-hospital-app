from typing import List, Optional, Any
from pydantic import BaseModel, ConfigDict

class WellnessCenterOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    slug: str
    name: str
    category: str
    state: str
    city: str
    area: str
    address: str
    pincode: str
    accreditation: Optional[str] = None
    overview: Optional[str] = None
    website: Optional[str] = None
    phone: Optional[str] = None
    whatsapp: Optional[str] = None
    maps_url: Optional[str] = None
    verification_status: str = "independently-checked"
    last_checked: Optional[str] = None
    images: List[Any] = []
    programs: List[str] = []
    disciplines: List[str] = []
    facilities: List[str] = []
    sources: List[Any] = []
