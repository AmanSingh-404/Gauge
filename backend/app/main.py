from fastapi import FastAPI, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.auth import router as auth_router

from app.api.workspaces import router as workspaces_router
from app.core.config import get_settings
from app.core.logging import configure_logging, log
from app.core.database import get_db
from app.api.api_keys import router as api_keys_router
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.core.rate_limit import limiter


settings = get_settings()
configure_logging(settings.environment)

app = FastAPI(title=settings.app_name)
app.include_router(auth_router)
app.include_router(workspaces_router)
app.include_router(api_keys_router)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


@app.get("/health")
def health_check():
    log.info("health_check_called", environment=settings.environment)
    return {"status": "ok", "environment": settings.environment}


@app.get("/health/db")
async def health_check_db(db: AsyncSession = Depends(get_db)):
    result = await db.execute(text("SELECT 1"))
    value = result.scalar()
    log.info("db_health_check_called", result=value)
    return {"status": "ok", "db_result": value}
