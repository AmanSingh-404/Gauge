import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class PromptCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=255)


class PromptResponse(BaseModel):
    id: uuid.UUID
    name: str
    created_at: datetime

    class Config:
        from_attributes = True


class PromptVersionCreateRequest(BaseModel):
    content: str = Field(min_length=1)


class PromptVersionResponse(BaseModel):
    id: uuid.UUID
    version_num: int
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


class PromptDiffResponse(BaseModel):
    from_version: int
    to_version: int
    diff: list[str]
