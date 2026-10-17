from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional, Union
import jwt
import logging
import hashlib
import secrets
from app.config import settings

logger = logging.getLogger(__name__)

# Password hashing setup
try:
    from pwdlib import PasswordHash
    password_hash = PasswordHash.recommended()

    def verify_password(plain_password: str, hashed_password: str) -> bool:
        return password_hash.verify(plain_password, hashed_password)

    def get_password_hash(password: str) -> str:
        return password_hash.hash(password)

except ImportError:
    # Fallback to bcrypt directly
    import bcrypt

    def verify_password(plain_password: str, hashed_password: str) -> bool:
        try:
            return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
        except Exception:
            return False

    def get_password_hash(password: str) -> str:
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def hash_token(token: str) -> str:
    """Generate SHA-256 hash for secure storage of refresh tokens."""
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Generate a signed JWT access token (15 mins default)."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({
        "exp": expire,
        "iat": datetime.now(timezone.utc),
        "type": "access",
    })
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt


def create_refresh_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Generate a signed JWT refresh token with 7 days expiry."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    
    to_encode.update({
        "exp": expire,
        "iat": datetime.now(timezone.utc),
        "type": "refresh",
        "jti": secrets.token_hex(16),
    })
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt


def decode_token(token: str, expected_type: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """Decode and validate a JWT access or refresh token."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        if expected_type and payload.get("type") != expected_type:
            logger.debug(f"Token type mismatch: expected {expected_type}, got {payload.get('type')}")
            return None
        return payload
    except jwt.PyJWTError as exc:
        logger.debug(f"JWT decode error: {exc}")
        return None


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    return decode_token(token, expected_type="access")


def decode_refresh_token(token: str) -> Optional[Dict[str, Any]]:
    return decode_token(token, expected_type="refresh")
