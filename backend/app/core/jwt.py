import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path

from jose import jwt

from app.core.config import get_settings

settings = get_settings()

_PRIVATE_KEY = Path(settings.jwt_private_key_path).read_text()
_PUBLIC_KEY = Path(settings.jwt_public_key_path).read_text()


def create_access_token(user_id: uuid.UUID) -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.jwt_access_token_expire_minutes
    )
    payload = {
        "sub": str(user_id),
        "type": "access",
        "exp": expire,
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, _PRIVATE_KEY, algorithm=settings.jwt_algorithm)


def create_refresh_token(user_id: uuid.UUID) -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        days=settings.jwt_refresh_token_expire_days
    )
    payload = {
        "sub": str(user_id),
        "type": "refresh",
        "exp": expire,
        "iat": datetime.now(timezone.utc),
        "jti": str(uuid.uuid4()),  # unique ID so we can revoke this specific token
    }
    return jwt.encode(payload, _PRIVATE_KEY, algorithm=settings.jwt_algorithm)


def decode_token(token: str) -> dict:
    return jwt.decode(token, _PUBLIC_KEY, algorithms=[settings.jwt_algorithm])


def create_email_verification_token(user_id: uuid.UUID) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=24)
    payload = {
        "sub": str(user_id),
        "type": "email_verification",
        "exp": expire,
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, _PRIVATE_KEY, algorithm=settings.jwt_algorithm)


def create_password_reset_token(user_id: uuid.UUID) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=1)
    payload = {
        "sub": str(user_id),
        "type": "password_reset",
        "exp": expire,
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, _PRIVATE_KEY, algorithm=settings.jwt_algorithm)
