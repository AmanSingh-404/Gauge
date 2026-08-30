import asyncio
from datetime import datetime, timezone

from sqlalchemy import select

from app.core.celery_app import celery_app
from app.core.database import AsyncSessionLocal
from app.models.eval_result import EvalResult
from app.models.eval_run import EvalRun
from app.models.prompt_version import PromptVersion
from app.models.test_case import TestCase
from app.services.llm.base import get_adapter


async def _run_eval(run_id: str) -> None:
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(EvalRun).where(EvalRun.id == run_id))
        run = result.scalar_one_or_none()
        if run is None:
            return

        run.status = "running"
        run.started_at = datetime.now(timezone.utc)
        await db.commit()

        try:
            prompt_result = await db.execute(
                select(PromptVersion).where(PromptVersion.id == run.prompt_version_id)
            )
            prompt_version = prompt_result.scalar_one()

            cases_result = await db.execute(
                select(TestCase).where(TestCase.suite_id == run.suite_id)
            )
            test_cases = cases_result.scalars().all()

            adapter = get_adapter(run.provider)

            for case in test_cases:
                response = await adapter.generate(
                    prompt=prompt_version.content,
                    input_text=case.input,
                    model=run.model,
                )
                eval_result = EvalResult(
                    run_id=run.id,
                    test_case_id=case.id,
                    response_text=response.text,
                    latency_ms=response.latency_ms,
                    input_tokens=response.input_tokens,
                    output_tokens=response.output_tokens,
                )
                db.add(eval_result)

            run.status = "completed"
        except Exception:
            run.status = "failed"
            raise
        finally:
            run.finished_at = datetime.now(timezone.utc)
            await db.commit()


@celery_app.task(name="run_eval_task")
def run_eval_task(run_id: str) -> None:
    asyncio.run(_run_eval(run_id))
