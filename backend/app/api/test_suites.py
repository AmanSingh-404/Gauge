import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import require_workspace_role
from app.models.test_case import TestCase
from app.models.test_suite import TestSuite
from app.schemas.test_suite import (
    TestCaseCreateRequest,
    TestCaseResponse,
    TestSuiteCreateRequest,
    TestSuiteResponse,
)

router = APIRouter(prefix="/workspaces/{workspace_id}/suites", tags=["test-suites"])


@router.post("/", response_model=TestSuiteResponse, status_code=status.HTTP_201_CREATED)
async def create_suite(
    payload: TestSuiteCreateRequest,
    db: AsyncSession = Depends(get_db),
    membership=Depends(require_workspace_role("editor")),
):
    new_suite = TestSuite(workspace_id=membership.workspace_id, name=payload.name)
    db.add(new_suite)
    await db.commit()
    await db.refresh(new_suite)
    return new_suite


@router.get("/", response_model=list[TestSuiteResponse])
async def list_suites(
    db: AsyncSession = Depends(get_db),
    membership=Depends(require_workspace_role("viewer")),
):
    result = await db.execute(
        select(TestSuite).where(TestSuite.workspace_id == membership.workspace_id)
    )
    return result.scalars().all()


@router.get("/{suite_id}", response_model=TestSuiteResponse)
async def get_suite(
    suite_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    membership=Depends(require_workspace_role("viewer")),
):
    result = await db.execute(
        select(TestSuite).where(
            TestSuite.id == suite_id, TestSuite.workspace_id == membership.workspace_id
        )
    )
    suite = result.scalar_one_or_none()
    if suite is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Test suite not found."
        )
    return suite


@router.post(
    "/{suite_id}/cases",
    response_model=TestCaseResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_test_case(
    suite_id: uuid.UUID,
    payload: TestCaseCreateRequest,
    db: AsyncSession = Depends(get_db),
    membership=Depends(require_workspace_role("editor")),
):
    result = await db.execute(
        select(TestSuite).where(
            TestSuite.id == suite_id, TestSuite.workspace_id == membership.workspace_id
        )
    )
    suite = result.scalar_one_or_none()
    if suite is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Test suite not found."
        )

    new_case = TestCase(
        suite_id=suite_id,
        input=payload.input,
        expected_output=payload.expected_output,
        rubric=payload.rubric,
    )
    db.add(new_case)
    await db.commit()
    await db.refresh(new_case)
    return new_case


@router.get("/{suite_id}/cases", response_model=list[TestCaseResponse])
async def list_test_cases(
    suite_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    membership=Depends(require_workspace_role("viewer")),
):
    result = await db.execute(select(TestCase).where(TestCase.suite_id == suite_id))
    return result.scalars().all()
