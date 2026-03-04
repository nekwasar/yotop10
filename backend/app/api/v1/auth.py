import uuid
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.security import decode_token
from app.schemas.auth import (
    RegisterRequest, LoginRequest, GoogleAuthRequest,
    VerifyEmailRequest, ForgotPasswordRequest, ResetPasswordRequest,
    RefreshTokenRequest, AuthResponse, UserPublic,
)
from app.services import auth as auth_service
from app.crud import user as user_crud
from app.models.user import User

router = APIRouter()

limiter = Limiter(key_func=get_remote_address)


def _auth_response(result: dict) -> AuthResponse:
    return AuthResponse(
        access_token=result["access_token"],
        refresh_token=result["refresh_token"],
        token_type=result["token_type"],
        user=UserPublic.model_validate(result["user"]),
    )


@router.post("/register", response_model=AuthResponse, status_code=201)
@limiter.limit("5/minute")
def register(request: Request, payload: RegisterRequest, db: Session = Depends(get_db)):
    try:
        result = auth_service.register(
            db,
            email=payload.email,
            password=payload.password,
            username=payload.username,
        )
        return _auth_response(result)
    except auth_service.AuthError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.post("/login", response_model=AuthResponse)
@limiter.limit("5/minute")
def login(request: Request, payload: LoginRequest, db: Session = Depends(get_db)):
    try:
        result = auth_service.login(db, email=payload.email, password=payload.password)
        return _auth_response(result)
    except auth_service.AuthError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.post("/google", response_model=AuthResponse)
async def google_login(payload: GoogleAuthRequest, db: Session = Depends(get_db)):
    try:
        result = await auth_service.google_auth(db, id_token=payload.id_token)
        return _auth_response(result)
    except auth_service.AuthError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.post("/verify-email", response_model=AuthResponse)
@limiter.limit("5/minute")
def verify_email(request: Request, payload: VerifyEmailRequest, db: Session = Depends(get_db)):
    try:
        result = auth_service.verify_email(db, email=payload.email, code=payload.code)
        return _auth_response(result)
    except auth_service.AuthError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.post("/forgot-password", status_code=200)
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    auth_service.forgot_password(db, email=payload.email)
    # Always return success — don't reveal if email exists
    return {"message": "If that email is registered, a reset link has been sent."}


@router.post("/reset-password", response_model=AuthResponse)
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    try:
        result = auth_service.reset_password(db, token=payload.token, new_password=payload.new_password)
        return _auth_response(result)
    except auth_service.AuthError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.post("/refresh", response_model=AuthResponse)
def refresh_token(payload: RefreshTokenRequest, db: Session = Depends(get_db)):
    token_data = decode_token(payload.refresh_token)
    if not token_data or token_data.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    user = user_crud.get_user_by_id(db, uuid.UUID(token_data["sub"]))
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    from app.core.security import create_access_token, create_refresh_token
    result = {
        "access_token": create_access_token({"sub": str(user.id)}),
        "refresh_token": create_refresh_token({"sub": str(user.id)}),
        "token_type": "bearer",
        "user": user,
    }
    return _auth_response(result)


@router.get("/me", response_model=UserPublic)
def get_me(current_user: User = Depends(get_current_user)):
    return UserPublic.model_validate(current_user)


@router.post("/test-email")
def test_email(current_user: User = Depends(get_current_user)):
    """
    Admin diagnostic: send a test email via Brevo to the current user's address.
    Useful for verifying BREVO_API_KEY and EMAIL_FROM are correctly set on the server.
    """
    from app.core.email import send_verification_email
    from app.core.config import settings
    ok = send_verification_email(current_user.email, current_user.username, "123456")
    return {
        "sent": ok,
        "to": current_user.email,
        "from": settings.EMAIL_FROM,
        "brevo_key_set": bool(settings.BREVO_API_KEY),
    }


@router.post("/logout")
def logout(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Logout - revoke the current session (if token contains session_id).
    """
    from app.core.security import decode_token
    from app.crud import session as session_crud
    
    auth_header = request.headers.get("authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header[7:]
        payload = decode_token(token)
        session_id = payload.get("session_id") if payload else None
        
        if session_id:
            try:
                session_crud.revoke_session(db, uuid.UUID(session_id))
            except Exception:
                pass
    
    return {"message": "Logged out successfully"}


@router.post("/logout-all")
def logout_all(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Logout of all devices - revoke all sessions for the current user.
    """
    from app.crud import session as session_crud
    
    count = session_crud.revoke_all_user_sessions(db, current_user.id)
    return {"message": f"Logged out from {count} device(s)"}


@router.post("/login-cookies")
@limiter.limit("5/minute")
def login_with_cookies(
    request: Request,
    payload: LoginRequest,
    db: Session = Depends(get_db),
):
    """
    Login and set tokens as HttpOnly cookies (XSS protection).
    Tokens are stored in cookies that cannot be accessed by JavaScript.
    """
    from fastapi.responses import JSONResponse
    
    # Rate limited version of login
    try:
        result = auth_service.login(db, email=payload.email, password=payload.password)
    except auth_service.AuthError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    
    access_token = result["access_token"]
    refresh_token = result["refresh_token"]
    
    # Create response with HttpOnly cookies
    response = JSONResponse({
        "user": result["user"],
        "message": "Logged in successfully"
    })
    
    # Set HttpOnly, Secure cookies
    # Access token - short lived (15 min)
    response.set_cookie(
        key="yotop10_access",
        value=access_token,
        httponly=True,
        secure=True,
        samesite="strict",
        max_age=15 * 60,
        path="/",
    )
    
    # Refresh token - longer lived (7 days for cookie)
    response.set_cookie(
        key="yotop10_refresh",
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite="strict",
        max_age=7 * 24 * 60 * 60,
        path="/",
    )
    
    return response


@router.post("/logout-cookies")
def logout_cookies(request: Request):
    """
    Logout by clearing HttpOnly cookies.
    """
    from fastapi.responses import JSONResponse
    
    response = JSONResponse({"message": "Logged out successfully"})
    
    # Clear the cookies
    response.delete_cookie(key="yotop10_access", path="/")
    response.delete_cookie(key="yotop10_refresh", path="/")
    
    return response
