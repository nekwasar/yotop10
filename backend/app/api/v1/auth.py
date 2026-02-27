import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
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


def _auth_response(result: dict) -> AuthResponse:
    return AuthResponse(
        access_token=result["access_token"],
        refresh_token=result["refresh_token"],
        token_type=result["token_type"],
        user=UserPublic.model_validate(result["user"]),
    )


@router.post("/register", response_model=AuthResponse, status_code=201)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    try:
        result = auth_service.register(
            db,
            email=payload.email,
            password=payload.password,
            username=payload.username,
            display_name=payload.display_name,
        )
        return _auth_response(result)
    except auth_service.AuthError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
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
def verify_email(payload: VerifyEmailRequest, db: Session = Depends(get_db)):
    try:
        result = auth_service.verify_email(db, token=payload.token)
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
