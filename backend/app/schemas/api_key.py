import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class ApiKeyCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)


class ApiKeyCreateResponse(BaseModel):
    id: uuid.UUID
    name: str
    key: str  # full key — only ever returned here, at creation time
    key_prefix: str


class ApiKeyResponse(BaseModel):
    id: uuid.UUID
    name: str
    key_prefix: str
    created_at: datetime
    revoked: bool

    class Config:
        from_attributes = True
