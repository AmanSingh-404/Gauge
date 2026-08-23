import uuid

from pydantic import BaseModel, Field, EmailStr


class WorkspaceCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=255)


class WorkspaceResponse(BaseModel):
    id: uuid.UUID
    name: str
    plan_tier: str

    class Config:
        from_attributes = True


class InviteMemberRequest(BaseModel):
    email: EmailStr
    role: str = Field(pattern="^(owner|editor|viewer)$")


class WorkspaceMemberResponse(BaseModel):
    user_id: uuid.UUID
    role: str

    class Config:
        from_attributes = True
