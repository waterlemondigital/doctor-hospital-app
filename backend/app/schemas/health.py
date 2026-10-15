from pydantic import BaseModel

class ServiceHealth(BaseModel):
    connected: bool
    message: str

class HealthResponse(BaseModel):
    status: str
    app_name: str
    environment: str
    database: ServiceHealth
