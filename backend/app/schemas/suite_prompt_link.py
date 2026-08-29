import uuid

from pydantic import BaseModel


class LinkPromptRequest(BaseModel):
    prompt_id: uuid.UUID


class SuitePromptLinkResponse(BaseModel):
    id: uuid.UUID
    suite_id: uuid.UUID
    prompt_id: uuid.UUID

    class Config:
        from_attributes = True
