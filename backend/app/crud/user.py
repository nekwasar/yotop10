import uuid
import secrets
from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy.orm import Session
from app.models.user import User


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()


def get_user_by_username(db: Session, username: str) -> Optional[User]:
    return db.query(User).filter(User.username == username).first()


def get_user_by_id(db: Session, user_id: uuid.UUID) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_google_id(db: Session, google_id: str) -> Optional[User]:
    return db.query(User).filter(User.google_id == google_id).first()


def get_user_by_verify_token(db: Session, token: str) -> Optional[User]:
    return db.query(User).filter(User.email_verify_token == token).first()


def get_user_by_reset_token(db: Session, token: str) -> Optional[User]:
    return db.query(User).filter(User.reset_password_token == token).first()


def create_user(
    db: Session,
    email: Optional[str],
    hashed_password: Optional[str],
    username: str,
    display_name: str,
    auth_provider: str = "email",
    google_id: Optional[str] = None,
    is_verified: bool = False,
) -> User:
    verify_token = secrets.token_urlsafe(32) if not is_verified else None
    user = User(
        id=uuid.uuid4(),
        email=email,
        hashed_password=hashed_password,
        username=username,
        display_name=display_name,
        auth_provider=auth_provider,
        google_id=google_id,
        is_verified=is_verified,
        email_verify_token=verify_token,
        email_verify_token_expires=(
            datetime.utcnow() + timedelta(hours=24) if verify_token else None
        ),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def set_email_verified(db: Session, user: User) -> User:
    user.is_verified = True
    user.email_verify_token = None
    user.email_verify_token_expires = None
    db.commit()
    db.refresh(user)
    return user


def set_reset_token(db: Session, user: User) -> str:
    token = secrets.token_urlsafe(32)
    user.reset_password_token = token
    user.reset_password_token_expires = datetime.utcnow() + timedelta(hours=1)
    db.commit()
    return token


def update_password(db: Session, user: User, hashed_password: str) -> User:
    user.hashed_password = hashed_password
    user.reset_password_token = None
    user.reset_password_token_expires = None
    db.commit()
    db.refresh(user)
    return user
