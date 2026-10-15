from typing import Optional, Literal
from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime

UserRole = Literal["patient", "doctor", "admin"]

class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: UserRole = "patient"
    phone: Optional[str] = None
    avatar: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    avatar: Optional[str] = None
    password: Optional[str] = None

class UserRead(UserBase):
    id: str
    is_active: bool
    is_verified: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
