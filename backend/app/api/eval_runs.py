import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import require_workspace_role
from app.models.eval_result import EvalResult
from app.models.eval_run import EvalRun
from app.schemas.eval_run import (
    EvalResultResponse,
    EvalRunCreateRequest,
    EvalRunResponse,
)
from app.workers.eval_tasks import run_eval_task

router = APIRouter(prefix="/workspaces/{workspace_id}/evals", tags=["evals"])


@router.post(
    "/run", response_model=EvalRunResponse, status_code=status.HTTP_202_ACCEPTED
)
async def trigger_eval_run(
    payload: EvalRunCreateRequest,
    db: AsyncSession = Depends(get_db),
    membership=Depends(require_workspace_role("editor")),
):
    if payload.idempotency_key:
        existing = await db.execute(
            select(EvalRun).where(EvalRun.idempotency_key == payload.idempotency_key)
        )
        existing_run = existing.scalar_one_or_none()
        if existing_run is not None:
            return existing_run

    new_run = EvalRun(
        suite_id=payload.suite_id,
        prompt_version_id=payload.prompt_version_id,
        model=payload.model,
        provider=payload.provider,
        status="pending",
        idempotency_key=payload.idempotency_key,
    )
    db.add(new_run)
    await db.commit()
    await db.refresh(new_run)

    run_eval_task.delay(str(new_run.id))

    return new_run


@router.get("/runs/{run_id}", response_model=EvalRunResponse)
async def get_eval_run(
    run_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    membership=Depends(require_workspace_role("viewer")),
):
    result = await db.execute(select(EvalRun).where(EvalRun.id == run_id))
    run = result.scalar_one_or_none()
    if run is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Eval run not found."
        )
    return run


@router.get("/runs/{run_id}/results", response_model=list[EvalResultResponse])
async def get_eval_results(
    run_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    membership=Depends(require_workspace_role("viewer")),
):
    result = await db.execute(select(EvalResult).where(EvalResult.run_id == run_id))
    return result.scalars().all()
