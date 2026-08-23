from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.workspace import Workspace
from app.models.workspace_member import WorkspaceMember
from app.schemas.workspace import WorkspaceCreateRequest, WorkspaceResponse
from app.core.deps import require_workspace_role
from app.schemas.workspace import InviteMemberRequest, WorkspaceMemberResponse

router = APIRouter(prefix="/workspaces", tags=["workspaces"])


@router.post("/", response_model=WorkspaceResponse, status_code=status.HTTP_201_CREATED)
async def create_workspace(
    payload: WorkspaceCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    new_workspace = Workspace(name=payload.name)
    db.add(new_workspace)
    await db.flush()  # get new_workspace.id before commit

    membership = WorkspaceMember(
        user_id=current_user.id,
        workspace_id=new_workspace.id,
        role="owner",
    )
    db.add(membership)
    await db.commit()
    await db.refresh(new_workspace)

    return new_workspace


@router.get("/", response_model=list[WorkspaceResponse])
async def list_my_workspaces(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Workspace)
        .join(WorkspaceMember, WorkspaceMember.workspace_id == Workspace.id)
        .where(WorkspaceMember.user_id == current_user.id)
    )
    return result.scalars().all()


@router.get("/{workspace_id}/editor-check")
async def editor_only_check(
    membership=Depends(require_workspace_role("editor")),
):
    return {
        "message": "You have editor access or higher.",
        "your_role": membership.role,
    }


@router.post(
    "/{workspace_id}/members",
    response_model=WorkspaceMemberResponse,
    status_code=status.HTTP_201_CREATED,
)
async def invite_member(
    payload: InviteMemberRequest,
    db: AsyncSession = Depends(get_db),
    membership=Depends(require_workspace_role("owner")),
):
    result = await db.execute(select(User).where(User.email == payload.email))
    invited_user = result.scalar_one_or_none()

    if invited_user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No user found with that email. They must sign up first.",
        )

    existing = await db.execute(
        select(WorkspaceMember).where(
            WorkspaceMember.workspace_id == membership.workspace_id,
            WorkspaceMember.user_id == invited_user.id,
        )
    )
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already a member of this workspace.",
        )

    new_membership = WorkspaceMember(
        user_id=invited_user.id,
        workspace_id=membership.workspace_id,
        role=payload.role,
    )
    db.add(new_membership)
    await db.commit()
    await db.refresh(new_membership)

    return new_membership
