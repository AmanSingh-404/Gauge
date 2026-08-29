import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class TestSuiteCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=255)


class TestSuiteResponse(BaseModel):
    id: uuid.UUID
    name: str
    created_at: datetime

    class Config:
        from_attributes = True


class TestCaseCreateRequest(BaseModel):
    input: str = Field(min_length=1)
    expected_output: str | None = None
    rubric: str | None = None


class TestCaseResponse(BaseModel):
    id: uuid.UUID
    input: str
    expected_output: str | None
    rubric: str | None
    created_at: datetime

    class Config:
        from_attributes = True
