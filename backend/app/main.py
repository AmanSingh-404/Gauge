from fastapi import FastAPI
from app.core.config import get_settings
from app.core.logging import configure_logging, log


settings = get_settings()
configure_logging(settings.environment)

app = FastAPI(title=settings.app_name)


@app.get("/health")
def health_check():
    log.info("health_check_called", environment=settings.environment)
    return {"status": "ok", "environment": settings.environment}
