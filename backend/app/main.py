from fastapi import FastAPI, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.logging import configure_logging, log
from app.core.database import get_db

settings = get_settings()
configure_logging(settings.environment)

app = FastAPI(title=settings.app_name)


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
