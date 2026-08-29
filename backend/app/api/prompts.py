import difflib
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import require_workspace_role
from app.models.prompt import Prompt
from app.models.prompt_version import PromptVersion
from app.schemas.prompt import (
    PromptCreateRequest,
    PromptDiffResponse,
    PromptResponse,
    PromptVersionCreateRequest,
    PromptVersionResponse,
)

router = APIRouter(prefix="/workspaces/{workspace_id}/prompts", tags=["prompts"])


@router.post("/", response_model=PromptResponse, status_code=status.HTTP_201_CREATED)
async def create_prompt(
    payload: PromptCreateRequest,
    db: AsyncSession = Depends(get_db),
    membership=Depends(require_workspace_role("editor")),
):
    new_prompt = Prompt(workspace_id=membership.workspace_id, name=payload.name)
    db.add(new_prompt)
    await db.commit()
    await db.refresh(new_prompt)
    return new_prompt


@router.get("/", response_model=list[PromptResponse])
async def list_prompts(
    db: AsyncSession = Depends(get_db),
    membership=Depends(require_workspace_role("viewer")),
):
    result = await db.execute(
        select(Prompt).where(Prompt.workspace_id == membership.workspace_id)
    )
    return result.scalars().all()


async def _get_prompt_or_404(
    db: AsyncSession, prompt_id: uuid.UUID, workspace_id: uuid.UUID
) -> Prompt:
    result = await db.execute(
        select(Prompt).where(
            Prompt.id == prompt_id, Prompt.workspace_id == workspace_id
        )
    )
    prompt = result.scalar_one_or_none()
    if prompt is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Prompt not found."
        )
    return prompt


@router.post(
    "/{prompt_id}/versions",
    response_model=PromptVersionResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_prompt_version(
    prompt_id: uuid.UUID,
    payload: PromptVersionCreateRequest,
    db: AsyncSession = Depends(get_db),
    membership=Depends(require_workspace_role("editor")),
):
    await _get_prompt_or_404(db, prompt_id, membership.workspace_id)

    result = await db.execute(
        select(func.max(PromptVersion.version_num)).where(
            PromptVersion.prompt_id == prompt_id
        )
    )
    max_version = result.scalar()
    next_version = (max_version or 0) + 1

    new_version = PromptVersion(
        prompt_id=prompt_id, version_num=next_version, content=payload.content
    )
    db.add(new_version)
    await db.commit()
    await db.refresh(new_version)
    return new_version


@router.get("/{prompt_id}/versions", response_model=list[PromptVersionResponse])
async def list_prompt_versions(
    prompt_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    membership=Depends(require_workspace_role("viewer")),
):
    await _get_prompt_or_404(db, prompt_id, membership.workspace_id)
    result = await db.execute(
        select(PromptVersion)
        .where(PromptVersion.prompt_id == prompt_id)
        .order_by(PromptVersion.version_num)
    )
    return result.scalars().all()


@router.get("/{prompt_id}/diff", response_model=PromptDiffResponse)
async def diff_prompt_versions(
    prompt_id: uuid.UUID,
    from_version: int = Query(..., alias="from"),
    to_version: int = Query(..., alias="to"),
    db: AsyncSession = Depends(get_db),
    membership=Depends(require_workspace_role("viewer")),
):
    await _get_prompt_or_404(db, prompt_id, membership.workspace_id)

    result = await db.execute(
        select(PromptVersion).where(
            PromptVersion.prompt_id == prompt_id,
            PromptVersion.version_num.in_([from_version, to_version]),
        )
    )
    versions = {v.version_num: v.content for v in result.scalars().all()}

    if from_version not in versions or to_version not in versions:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="One or both prompt versions not found.",
        )

    diff_lines = list(
        difflib.unified_diff(
            versions[from_version].splitlines(),
            versions[to_version].splitlines(),
            lineterm="",
        )
    )

    return PromptDiffResponse(
        from_version=from_version, to_version=to_version, diff=diff_lines
    )
