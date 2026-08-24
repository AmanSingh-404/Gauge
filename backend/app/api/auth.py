from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from jose import JWTError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.jwt import (
    create_access_token,
    create_email_verification_token,
    create_password_reset_token,
    create_refresh_token,
    decode_token,
)
from app.core.mail import send_email
from app.core.security import hash_password, hash_token, verify_password
from app.models.refresh_token import RefreshToken
from app.models.user import User
from app.schemas.user import (
    ForgotPasswordRequest,
    LoginRequest,
    RefreshRequest,
    ResetPasswordRequest,
    TokenResponse,
    UserResponse,
    UserSignupRequest,
    VerifyEmailRequest,
)
from app.core.rate_limit import limiter
from fastapi import Request

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post(
    "/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED
)
@limiter.limit("5/minute")
async def signup(
    request: Request, payload: UserSignupRequest, db: AsyncSession = Depends(get_db)
):
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

    verification_token = create_email_verification_token(new_user.id)
    verification_link = f"http://localhost:3000/verify-email?token={verification_token}"

    await send_email(
        subject="Verify your Gauge account",
        recipient=new_user.email,
        body=f"<p>Welcome to Gauge! Click the link below to verify your email:</p>"
        f'<p><a href="{verification_link}">{verification_link}</a></p>'
        f"<p>This link expires in 24 hours.</p>",
    )

    return new_user


@router.post("/login", response_model=TokenResponse)
@limiter.limit("5/minute")
async def login(
    request: Request, payload: LoginRequest, db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()

    if user is not None and user.locked_until is not None:
        if user.locked_until > datetime.now(timezone.utc):
            raise HTTPException(
                status_code=status.HTTP_423_LOCKED,
                detail="Account temporarily locked due to repeated failed login attempts. Try again later.",
            )
        else:
            user.failed_login_attempts = 0
            user.locked_until = None

    if user is None or not verify_password(payload.password, user.password_hash):
        if user is not None:
            user.failed_login_attempts += 1
            if user.failed_login_attempts >= 5:
                user.locked_until = datetime.now(timezone.utc) + timedelta(minutes=15)
            await db.commit()

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    user.failed_login_attempts = 0
    user.locked_until = None

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


@router.post("/verify-email")
async def verify_email(payload: VerifyEmailRequest, db: AsyncSession = Depends(get_db)):
    try:
        decoded = decode_token(payload.token)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token.",
        )

    if decoded.get("type") != "email_verification":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid token type.",
        )

    result = await db.execute(select(User).where(User.id == decoded["sub"]))
    user = result.scalar_one_or_none()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found."
        )

    user.email_verified = True
    await db.commit()

    return {"message": "Email verified successfully."}


@router.post("/forgot-password")
@limiter.limit("5/minute")
async def forgot_password(
    request: Request, payload: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()

    if user is not None:
        reset_token = create_password_reset_token(user.id)
        reset_link = f"http://localhost:3000/reset-password?token={reset_token}"
        await send_email(
            subject="Reset your Gauge password",
            recipient=user.email,
            body=f"<p>Click the link below to reset your password:</p>"
            f'<p><a href="{reset_link}">{reset_link}</a></p>'
            f"<p>This link expires in 1 hour.</p>",
        )

    return {"message": "If that email exists, a reset link has been sent."}


@router.post("/reset-password")
async def reset_password(
    payload: ResetPasswordRequest, db: AsyncSession = Depends(get_db)
):
    try:
        decoded = decode_token(payload.token)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token.",
        )

    if decoded.get("type") != "password_reset":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid token type.",
        )

    result = await db.execute(select(User).where(User.id == decoded["sub"]))
    user = result.scalar_one_or_none()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found."
        )

    user.password_hash = hash_password(payload.new_password)
    await db.commit()

    return {"message": "Password reset successfully."}
