import hashlib
import secrets

import bcrypt


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def hash_password(password: str) -> str:
    password_bytes = password.encode("utf-8")
    hashed = bcrypt.hashpw(password_bytes, bcrypt.gensalt())
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(
        plain_password.encode("utf-8"), hashed_password.encode("utf-8")
    )


def generate_api_key() -> tuple[str, str, str]:
    """Returns (full_key, prefix, hash) — full_key is shown to user once."""
    raw_secret = secrets.token_urlsafe(32)
    full_key = f"gauge_live_{raw_secret}"
    prefix = full_key[:12]
    key_hash = hash_token(full_key)
    return full_key, prefix, key_hash
