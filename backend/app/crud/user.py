import uuid
import secrets
from datetime import datetime, timedelta
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.user import User, ProfileVisibility
from app.models.badge import Badge, UserBadge
from app.schemas.user import ProfileUpdateRequest


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
    user = User(
        id=uuid.uuid4(),
        email=email,
        hashed_password=hashed_password,
        username=username,
        display_name=display_name,
        auth_provider=auth_provider,
        google_id=google_id,
        is_verified=is_verified,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def set_verify_code(db: Session, user: User, code: str) -> None:
    """Store a 6-digit OTP and a 5-minute expiry on the user row."""
    user.email_verify_code = code
    user.email_verify_code_expires = datetime.utcnow() + timedelta(minutes=5)
    db.commit()


def set_email_verified(db: Session, user: User) -> User:
    user.is_verified = True
    user.email_verify_code = None
    user.email_verify_code_expires = None
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


# ─────────────────────────────────────────────────────────────────────────────
# M4: Profile CRUD functions
# ─────────────────────────────────────────────────────────────────────────────

def get_follower_count(db: Session, user_id: uuid.UUID) -> int:
    """Return the number of users following `user_id`."""
    from app.models.social import Follow
    return db.query(func.count(Follow.id)).filter(Follow.following_id == user_id).scalar() or 0


def get_following_count(db: Session, user_id: uuid.UUID) -> int:
    """Return the number of users that `user_id` is following."""
    from app.models.social import Follow
    return db.query(func.count(Follow.id)).filter(Follow.follower_id == user_id).scalar() or 0


def get_user_badges(db: Session, user_id: uuid.UUID) -> List[UserBadge]:
    """Return UserBadge rows (joined to Badge) for a given user."""
    return (
        db.query(UserBadge)
        .filter(UserBadge.user_id == user_id)
        .join(Badge, UserBadge.badge_id == Badge.id)
        .all()
    )


def get_approved_post_count(db: Session, user_id: uuid.UUID) -> int:
    """Return the number of approved posts a user has made."""
    from app.models.post import Post
    return (
        db.query(func.count(Post.id))
        .filter(Post.author_id == user_id, Post.status == "approved")
        .scalar()
        or 0
    )


def get_user_posts(db: Session, user_id: uuid.UUID, viewer_id: Optional[uuid.UUID] = None, skip: int = 0, limit: int = 20):
    """
    Retrieve a user's posts with privacy-aware filtering.

    - Always returns posts whose author is user_id.
    - Respects post-level visibility:
        • public  → visible to everyone
        • connections_only → visible to connections and the owner
        • private → visible only to owner
    """
    from app.models.post import Post

    is_owner = viewer_id == user_id

    query = db.query(Post).filter(Post.author_id == user_id, Post.status == "approved")

    if not is_owner:
        # Determine if viewer has a confirmed connection to this user
        viewer_is_connection = False
        if viewer_id:
            from app.models.social import Connection
            viewer_is_connection = (
                db.query(Connection)
                .filter(
                    Connection.status == "accepted",
                    (
                        (Connection.requester_id == viewer_id) & (Connection.receiver_id == user_id)
                        | (Connection.requester_id == user_id) & (Connection.receiver_id == viewer_id)
                    ),
                )
                .first()
                is not None
            )

        if viewer_is_connection:
            # Connections can see public + connections_only posts
            query = query.filter(
                Post.visibility.in_(["public", "connections_only"])
            )
        else:
            # Everyone else only sees public posts
            query = query.filter(Post.visibility == "public")

    return query.order_by(Post.created_at.desc()).offset(skip).limit(limit).all()


def update_profile(db: Session, user: User, data: ProfileUpdateRequest) -> User:
    """Update editable profile fields. Only sets fields that are explicitly provided."""
    if data.display_name is not None:
        user.display_name = data.display_name
    if data.bio is not None:
        user.bio = data.bio
    if data.privacy is not None:
        user.profile_visibility = data.privacy
    user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(user)
    return user


def update_avatar(db: Session, user: User, avatar_url: str) -> User:
    """Persist the new CDN avatar URL to the user record."""
    user.avatar_url = avatar_url
    user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(user)
    return user


def check_is_connection(db: Session, user_a_id: uuid.UUID, user_b_id: uuid.UUID) -> bool:
    """Return True if user_a and user_b have an accepted connection."""
    from app.models.social import Connection
    return (
        db.query(Connection)
        .filter(
            Connection.status == "accepted",
            (
                ((Connection.requester_id == user_a_id) & (Connection.receiver_id == user_b_id))
                | ((Connection.requester_id == user_b_id) & (Connection.receiver_id == user_a_id))
            ),
        )
        .first()
        is not None
    )
