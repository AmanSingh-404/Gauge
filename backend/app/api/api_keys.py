import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import require_workspace_role
from app.core.security import generate_api_key
from app.models.api_key import ApiKey
from app.schemas.api_key import (
    ApiKeyCreateRequest,
    ApiKeyCreateResponse,
    ApiKeyResponse,
)

router = APIRouter(prefix="/workspaces/{workspace_id}/api-keys", tags=["api-keys"])


@router.post(
    "/", response_model=ApiKeyCreateResponse, status_code=status.HTTP_201_CREATED
)
async def create_api_key(
    payload: ApiKeyCreateRequest,
    db: AsyncSession = Depends(get_db),
    membership=Depends(require_workspace_role("owner")),
):
    full_key, prefix, key_hash = generate_api_key()

    new_key = ApiKey(
        workspace_id=membership.workspace_id,
        name=payload.name,
        key_prefix=prefix,
        key_hash=key_hash,
    )
    db.add(new_key)
    await db.commit()
    await db.refresh(new_key)

    return ApiKeyCreateResponse(
        id=new_key.id,
        name=new_key.name,
        key=full_key,
        key_prefix=new_key.key_prefix,
    )


@router.get("/", response_model=list[ApiKeyResponse])
async def list_api_keys(
    db: AsyncSession = Depends(get_db),
    membership=Depends(require_workspace_role("viewer")),
):
    result = await db.execute(
        select(ApiKey).where(ApiKey.workspace_id == membership.workspace_id)
    )
    return result.scalars().all()


@router.delete("/{key_id}", status_code=status.HTTP_204_NO_CONTENT)
async def revoke_api_key(
    key_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    membership=Depends(require_workspace_role("owner")),
):
    result = await db.execute(
        select(ApiKey).where(
            ApiKey.id == key_id, ApiKey.workspace_id == membership.workspace_id
        )
    )
    key = result.scalar_one_or_none()

    if key is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="API key not found."
        )

    key.revoked = True
    await db.commit()

    return None
