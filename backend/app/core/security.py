from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
import hashlib
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_token_fingerprint(token: str) -> str:
    """Create a fingerprint for a token (hash of the token itself)."""
    return hashlib.sha256(token.encode()).hexdigest()[:64]


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None, session_id: Optional[str] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire, "type": "access"})
    if session_id:
        to_encode["session_id"] = session_id
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(data: dict, session_id: Optional[str] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=90)
    to_encode.update({"exp": expire, "type": "refresh"})
    if session_id:
        to_encode["session_id"] = session_id
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None
