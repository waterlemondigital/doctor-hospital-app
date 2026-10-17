from datetime import timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.config import settings
from app.db.postgres import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserRead
from app.schemas.token import Token, AuthResponse
from app.core.security import (
    verify_password,
    get_password_hash,
    hash_token,
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
)
from app.core.rate_limiter import rate_limit_endpoint
from app.api.deps import get_current_active_user, require_role

router = APIRouter(prefix="/auth", tags=["Authentication"])

def _set_auth_cookies(response: Response, access_token: str, refresh_token: str):
    """
    Set both access and refresh tokens in HttpOnly, SameSite cookies.
    - access_token: 15 minutes TTL
    - refresh_token: 7 days TTL
    """
    access_max_age = settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    refresh_max_age = settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60

    # 1. Access Token Cookie
    response.set_cookie(
        key="access_token",
        value=access_token,
        max_age=access_max_age,
        expires=access_max_age,
        httponly=True,
        secure=settings.AUTH_COOKIE_SECURE,
        samesite=settings.AUTH_COOKIE_SAMESITE,
        path="/",
    )

    # 2. Refresh Token Cookie (scoped to /api/v1/auth for minimal exposure)
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        max_age=refresh_max_age,
        expires=refresh_max_age,
        httponly=True,
        secure=settings.AUTH_COOKIE_SECURE,
        samesite=settings.AUTH_COOKIE_SAMESITE,
        path="/api/v1/auth",
    )


def _clear_auth_cookies(response: Response):
    """Clear both access and refresh token cookies."""
    response.delete_cookie(
        key="access_token",
        path="/",
        secure=settings.AUTH_COOKIE_SECURE,
        samesite=settings.AUTH_COOKIE_SAMESITE,
    )
    response.delete_cookie(
        key="refresh_token",
        path="/api/v1/auth",
        secure=settings.AUTH_COOKIE_SECURE,
        samesite=settings.AUTH_COOKIE_SAMESITE,
    )


@router.post(
    "/signup",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(rate_limit_endpoint(max_requests=10, window_seconds=60, key_prefix="signup"))],
)
async def signup(
    user_in: UserCreate,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    """
    Register a new user with role ('patient' or 'doctor').
    Rate-limited to 10 attempts/min.
    Sets access_token (15m) and refresh_token (7d) in secure HttpOnly cookies.
    """
    # Enforce role validation
    if user_in.role not in ("patient", "doctor"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role must be either 'patient' or 'doctor'.",
        )

    # Check existing email
    existing_user_query = select(User).where(User.email == user_in.email.lower().strip())
    result = await db.execute(existing_user_query)
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists.",
        )

    # Hash password and create initial refresh token
    hashed_pwd = get_password_hash(user_in.password)
    user = User(
        email=user_in.email.lower().strip(),
        hashed_password=hashed_pwd,
        name=user_in.name,
        role=user_in.role,
        phone=user_in.phone,
        avatar=user_in.avatar,
        is_active=True,
        is_verified=False,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    # Generate Tokens
    token_claims = {"sub": user.id, "email": user.email, "role": user.role}
    access_token = create_access_token(token_claims)
    refresh_token = create_refresh_token(token_claims)

    # Save hashed refresh token to user row
    user.hashed_refresh_token = hash_token(refresh_token)
    await db.commit()

    # Set cookies
    _set_auth_cookies(response, access_token, refresh_token)

    return AuthResponse(
        status="success",
        message="Account created successfully",
        user=UserRead.model_validate(user),
    )


@router.post(
    "/login",
    response_model=AuthResponse,
    dependencies=[Depends(rate_limit_endpoint(max_requests=5, window_seconds=60, key_prefix="login"))],
)
async def login(
    user_in: UserLogin,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    """
    Authenticate user with email and password.
    Rate-limited to 5 attempts/min.
    Sets access token and 7-day refresh token in HttpOnly cookies.
    """
    query = select(User).where(User.email == user_in.email.lower().strip())
    result = await db.execute(query)
    user = result.scalar_one_or_none()

    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive.",
        )

    # Generate tokens
    token_claims = {"sub": user.id, "email": user.email, "role": user.role}
    access_token = create_access_token(token_claims)
    refresh_token = create_refresh_token(token_claims)

    # Store hashed refresh token in database for rotation/invalidation
    user.hashed_refresh_token = hash_token(refresh_token)
    await db.commit()

    # Set HttpOnly cookies
    _set_auth_cookies(response, access_token, refresh_token)

    return AuthResponse(
        status="success",
        message="Logged in successfully",
        user=UserRead.model_validate(user),
    )


@router.post(
    "/refresh",
    response_model=AuthResponse,
    dependencies=[Depends(rate_limit_endpoint(max_requests=20, window_seconds=60, key_prefix="refresh"))],
)
async def refresh_access_token(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    """
    Rotate tokens using the 7-day refresh_token stored in HttpOnly cookie.
    Validates token signature, expiration (7 days), and matches stored hash in database.
    Issues a new access_token and rotated refresh_token.
    """
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        _clear_auth_cookies(response)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token missing from cookie.",
        )

    payload = decode_refresh_token(refresh_token)
    if not payload:
        _clear_auth_cookies(response)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token invalid or expired (7-day lifetime reached). Please sign in again.",
        )

    user_id = payload.get("sub")
    query = select(User).where(User.id == user_id)
    result = await db.execute(query)
    user = result.scalar_one_or_none()

    if not user or not user.is_active:
        _clear_auth_cookies(response)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account not found or deactivated.",
        )

    # Compare hashed token with DB to prevent token reuse/replay attacks
    expected_hash = hash_token(refresh_token)
    if user.hashed_refresh_token != expected_hash:
        # Possible token theft or duplicate reuse — revoke refresh token immediately
        user.hashed_refresh_token = None
        await db.commit()
        _clear_auth_cookies(response)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token detected. Security reset performed. Please sign in again.",
        )

    # Rotate tokens: issue new access token and new 7-day refresh token
    token_claims = {"sub": user.id, "email": user.email, "role": user.role}
    new_access_token = create_access_token(token_claims)
    new_refresh_token = create_refresh_token(token_claims)

    user.hashed_refresh_token = hash_token(new_refresh_token)
    await db.commit()

    _set_auth_cookies(response, new_access_token, new_refresh_token)

    return AuthResponse(
        status="success",
        message="Token refreshed successfully",
        user=UserRead.model_validate(user),
    )


@router.post("/logout")
async def logout(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    """
    Log out the user:
    - Clears access and refresh token cookies
    - Invalidates hashed_refresh_token in the database
    """
    refresh_token = request.cookies.get("refresh_token")
    if refresh_token:
        payload = decode_refresh_token(refresh_token)
        if payload and payload.get("sub"):
            query = select(User).where(User.id == payload.get("sub"))
            result = await db.execute(query)
            user = result.scalar_one_or_none()
            if user:
                user.hashed_refresh_token = None
                await db.commit()

    _clear_auth_cookies(response)
    return {"status": "success", "message": "Logged out successfully"}


@router.get("/me", response_model=UserRead)
async def get_current_user_profile(current_user: User = Depends(get_current_active_user)):
    """Fetch current logged-in user profile from HttpOnly cookie session."""
    return UserRead.model_validate(current_user)


# Role-Based Verification Endpoints for Testing RBAC
@router.get("/doctor-area", dependencies=[Depends(require_role(["doctor"]))])
async def doctor_exclusive_dashboard(current_user: User = Depends(get_current_active_user)):
    """Exclusive endpoint accessible only by verified Doctors."""
    return {
        "status": "success",
        "message": f"Welcome to the Doctor Portal, {current_user.name}!",
        "role": current_user.role,
    }


@router.get("/patient-area", dependencies=[Depends(require_role(["patient"]))])
async def patient_exclusive_area(current_user: User = Depends(get_current_active_user)):
    """Exclusive endpoint accessible only by Patients."""
    return {
        "status": "success",
        "message": f"Welcome to your Patient Medical Profile, {current_user.name}!",
        "role": current_user.role,
    }
