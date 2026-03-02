from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy.orm import Session
import httpx
import random
import string
import logging

from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token
from app.core.email import send_verification_email, send_password_reset_email
from app.crud import user as user_crud
from app.models.user import User

logger = logging.getLogger(__name__)


def _generate_otp() -> str:
    """Generate a 6-digit numeric verification code."""
    return ''.join(random.choices(string.digits, k=6))


class AuthError(Exception):
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


def _make_tokens(user: User) -> dict:
    payload = {"sub": str(user.id)}
    return {
        "access_token": create_access_token(payload),
        "refresh_token": create_refresh_token(payload),
        "token_type": "bearer",
        "user": user,
    }


def register(db: Session, email: str, password: str, username: str) -> dict:
    existing = user_crud.get_user_by_email(db, email)

    if existing:
        if not existing.is_verified:
            # User started signup but never verified — resend a fresh OTP
            code = _generate_otp()
            user_crud.set_verify_code(db, existing, code)
            ok = send_verification_email(email, existing.username, code)
            if not ok:
                logger.error("Brevo: failed to send verification email to %s", email)
            return _make_tokens(existing)
        raise AuthError("Email already registered", 409)

    if user_crud.get_user_by_username(db, username):
        raise AuthError("Username already taken", 409)

    hashed = hash_password(password)
    # display_name defaults to username — editable later in /settings/profile
    user = user_crud.create_user(
        db, email=email, hashed_password=hashed,
        username=username, display_name=username,
        auth_provider="email", is_verified=False,
    )

    # Generate 6-digit OTP with 5-minute expiry
    code = _generate_otp()
    user_crud.set_verify_code(db, user, code)

    ok = send_verification_email(email, username, code)
    if not ok:
        logger.error("Brevo: failed to send verification email to %s", email)

    return _make_tokens(user)


def login(db: Session, email: str, password: str) -> dict:
    user = user_crud.get_user_by_email(db, email)
    if not user or not user.hashed_password:
        raise AuthError("Invalid credentials", 401)
    if not verify_password(password, user.hashed_password):
        raise AuthError("Invalid credentials", 401)
    if not user.is_active or user.is_banned:
        raise AuthError("Account suspended or banned", 403)
    return _make_tokens(user)


async def google_auth(db: Session, id_token: str) -> dict:
    """Verify Google ID token, then log in or create account."""
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"https://oauth2.googleapis.com/tokeninfo?id_token={id_token}"
        )
    if resp.status_code != 200:
        raise AuthError("Invalid Google token", 401)

    data = resp.json()
    google_id = data.get("sub")
    email = data.get("email")
    name = data.get("name", email.split("@")[0] if email else "user")

    if not google_id or not email:
        raise AuthError("Google token missing required fields", 401)

    # Try existing google_id first, then email
    user = user_crud.get_user_by_google_id(db, google_id)
    if not user:
        user = user_crud.get_user_by_email(db, email)
        if user:
            # Existing email user — link Google ID
            user.google_id = google_id
            db.commit()
        else:
            # New user — create account (Google users are auto-verified)
            username = email.split("@")[0].lower().replace(".", "_")[:30]
            # Ensure username uniqueness
            base = username
            counter = 1
            while user_crud.get_user_by_username(db, username):
                username = f"{base}{counter}"
                counter += 1
            user = user_crud.create_user(
                db, email=email, hashed_password=None,
                username=username, display_name=name,
                auth_provider="google", google_id=google_id,
                is_verified=True,
            )

    if not user.is_active or user.is_banned:
        raise AuthError("Account suspended or banned", 403)

    return _make_tokens(user)


def verify_email(db: Session, email: str, code: str) -> dict:
    user = user_crud.get_user_by_email(db, email)
    if not user:
        raise AuthError("Account not found.", 404)

    if user.is_verified:
        return _make_tokens(user)  # Already verified — just log them in

    if not user.email_verify_code or user.email_verify_code != code:
        raise AuthError("Incorrect verification code.", 400)

    if user.email_verify_code_expires and user.email_verify_code_expires < datetime.utcnow():
        raise AuthError("Code expired. A new code has been sent to your email.", 400)

    user_crud.set_email_verified(db, user)
    return _make_tokens(user)


def forgot_password(db: Session, email: str) -> bool:
    user = user_crud.get_user_by_email(db, email)
    if not user or not user.hashed_password:
        # Don't reveal whether email exists
        return True

    token = user_crud.set_reset_token(db, user)
    send_password_reset_email(email, user.display_name, token)
    return True


def reset_password(db: Session, token: str, new_password: str) -> dict:
    user = user_crud.get_user_by_reset_token(db, token)
    if not user:
        raise AuthError("Invalid or expired reset link", 400)

    if user.reset_password_token_expires and user.reset_password_token_expires < datetime.utcnow():
        raise AuthError("Reset link has expired. Request a new one.", 400)

    hashed = hash_password(new_password)
    user_crud.update_password(db, user, hashed)
    return _make_tokens(user)
