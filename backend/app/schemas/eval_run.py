import uuid
from datetime import datetime

from pydantic import BaseModel


class EvalRunCreateRequest(BaseModel):
    suite_id: uuid.UUID
    prompt_version_id: uuid.UUID
    model: str
    provider: str


class EvalRunResponse(BaseModel):
    id: uuid.UUID
    suite_id: uuid.UUID
    prompt_version_id: uuid.UUID
    model: str
    provider: str
    status: str
    created_at: datetime
    started_at: datetime | None
    finished_at: datetime | None

    class Config:
        from_attributes = True


class EvalResultResponse(BaseModel):
    id: uuid.UUID
    test_case_id: uuid.UUID
    response_text: str
    latency_ms: int
    input_tokens: int
    output_tokens: int
    correctness_score: float | None
    hallucination_score: float | None

    class Config:
        from_attributes = True
