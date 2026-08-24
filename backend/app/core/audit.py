import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_log import AuditLog


async def log_audit_event(
    db: AsyncSession,
    action: str,
    user_id: uuid.UUID | None = None,
    workspace_id: uuid.UUID | None = None,
    details: str | None = None,
    ip_address: str | None = None,
) -> None:
    entry = AuditLog(
        user_id=user_id,
        workspace_id=workspace_id,
        action=action,
        details=details,
        ip_address=ip_address,
    )
    db.add(entry)
    # Note: caller is responsible for db.commit() — usually happens alongside
    # the main operation's commit, so the audit entry and the action are atomic.
