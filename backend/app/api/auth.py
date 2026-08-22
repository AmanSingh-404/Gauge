from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.jwt import create_access_token, create_refresh_token, decode_token
from app.core.security import hash_password, hash_token, verify_password
from app.models.refresh_token import RefreshToken
from app.models.user import User
from app.schemas.user import (
    LoginRequest,
    RefreshRequest,
    TokenResponse,
    UserResponse,
    UserSignupRequest,
)
from jose import JWTError

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post(
    "/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED
)
async def signup(payload: UserSignupRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == payload.email))
    existing_user = result.scalar_one_or_none()

    if existing_user is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists.",
        )

    new_user = User(
        email=payload.email,
        password_hash=hash_password(payload.password),
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    return new_user


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()

    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)

    decoded_refresh = decode_token(refresh_token)
    refresh_record = RefreshToken(
        user_id=user.id,
        jti=decoded_refresh["jti"],
        token_hash=hash_token(refresh_token),
        expires_at=datetime.fromtimestamp(decoded_refresh["exp"], tz=timezone.utc),
    )
    db.add(refresh_record)
    await db.commit()

    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/refresh", response_model=TokenResponse)
async def refresh(payload: RefreshRequest, db: AsyncSession = Depends(get_db)):
    try:
        decoded = decode_token(payload.refresh_token)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token.",
        )

    if decoded.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token is not a refresh token.",
        )

    result = await db.execute(
        select(RefreshToken).where(RefreshToken.jti == decoded["jti"])
    )
    token_record = result.scalar_one_or_none()

    if token_record is None or token_record.revoked:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token has been revoked or does not exist.",
        )

    if token_record.token_hash != hash_token(payload.refresh_token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token mismatch.",
        )

    # Rotate: revoke the old token
    token_record.revoked = True

    user_id = token_record.user_id
    new_access_token = create_access_token(user_id)
    new_refresh_token = create_refresh_token(user_id)

    decoded_new_refresh = decode_token(new_refresh_token)
    new_refresh_record = RefreshToken(
        user_id=user_id,
        jti=decoded_new_refresh["jti"],
        token_hash=hash_token(new_refresh_token),
        expires_at=datetime.fromtimestamp(decoded_new_refresh["exp"], tz=timezone.utc),
    )
    db.add(new_refresh_record)
    await db.commit()

    return TokenResponse(access_token=new_access_token, refresh_token=new_refresh_token)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(payload: RefreshRequest, db: AsyncSession = Depends(get_db)):
    try:
        decoded = decode_token(payload.refresh_token)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token.",
        )

    result = await db.execute(
        select(RefreshToken).where(RefreshToken.jti == decoded.get("jti"))
    )
    token_record = result.scalar_one_or_none()

    if token_record is not None:
        token_record.revoked = True
        await db.commit()

    return None
