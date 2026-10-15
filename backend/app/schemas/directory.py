from typing import Optional
from pydantic import BaseModel, ConfigDict

class CityOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    state_id: str
    state_name: str
    is_active: bool
    hospital_count: int

class SpecialityOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    description: Optional[str] = None
    icon_name: Optional[str] = None
