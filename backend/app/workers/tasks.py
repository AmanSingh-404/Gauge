from app.core.celery_app import celery_app


@celery_app.task(name="ping_task")
def ping_task() -> str:
    return "pong"
