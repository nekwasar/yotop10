from datetime import datetime
from typing import Optional
from uuid import UUID
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_token
from app.crud import user as user_crud
from app.crud import session as session_crud
from app.models.user import User

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Require authenticated user. Raises 401 if not authenticated."""
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    payload = decode_token(credentials.credentials)
    if not payload or payload.get("type") != "access":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    # Validate session if session_id is present in token
    session_id = payload.get("session_id")
    if session_id:
        session = session_crud.get_session_by_id(db, UUID(session_id))
        if not session or session.is_revoked or session.expires_at.strftime('%Y-%m-%d %H:%M:%S') < datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S'):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session revoked or expired")

    user = user_crud.get_user_by_id(db, UUID(user_id))
    if not user or not user.is_active or user.is_banned:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive")

    return user


def get_verified_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Require authenticated AND email-verified user. Raises 401 if not verified."""
    user = get_current_user(credentials, db)
    
    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email verification required. Please verify your email to access this feature."
        )
    
    return user


def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> Optional[User]:
    """Optional auth — returns None if not authenticated (for public endpoints that behave differently when logged in)."""
    if not credentials:
        return None
    try:
        return get_current_user(credentials, db)
    except HTTPException:
        return None


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user


def get_current_user_from_cookies(
    request: Request,
    db: Session = Depends(get_db),
) -> User:
    """Get authenticated user from HttpOnly cookies (XSS protection).
    
    This dependency reads tokens from HttpOnly cookies instead of the Authorization header.
    Use this for cookie-based authentication to prevent XSS token theft.
    """
    # Try to get access token from cookie
    access_token = request.cookies.get("yotop10_access")
    
    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Not authenticated. Please log in."
        )
    
    payload = decode_token(access_token)
    if not payload or payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid or expired token"
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid token payload"
        )
    
    # Validate session if session_id is present in token
    session_id = payload.get("session_id")
    if session_id:
        session = session_crud.get_session_by_id(db, UUID(session_id))
        if not session or session.is_revoked or session.expires_at < datetime.utcnow():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, 
                detail="Session revoked or expired"
            )
    
    user = user_crud.get_user_by_id(db, UUID(user_id))
    if not user or not user.is_active or user.is_banned:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="User not found or inactive"
        )
    
    return user
