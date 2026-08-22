import uuid

from pydantic import BaseModel, Field


class WorkspaceCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=255)


class WorkspaceResponse(BaseModel):
    id: uuid.UUID
    name: str
    plan_tier: str

    class Config:
        from_attributes = True
