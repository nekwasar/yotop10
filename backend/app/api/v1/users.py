"""
api/v1/users.py — Public and authenticated user profile endpoints.

Endpoints:
  GET  /users/{username}         → Public profile (privacy-gated)
  GET  /users/{username}/posts   → User post history (privacy-gated)
  PATCH /users/me                → Update own profile (auth required)
  POST  /users/me/avatar         → Upload avatar image (auth required)
"""
import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user, get_current_user_optional
from app.crud import user as user_crud
from app.models.user import User, ProfileVisibility
from app.schemas.user import UserProfile, ProfileUpdateRequest, BadgeInfo
from app.services import user as user_service

router = APIRouter()


# ─────────────────────────────────────────────────────────────────────────────
# Helper: Assemble UserProfile response object from a User ORM instance
# ─────────────────────────────────────────────────────────────────────────────

def _build_profile_response(user: User, db: Session) -> UserProfile:
    """Compose the full UserProfile schema from the ORM user + related queries."""

    # Resolve earned badges (UserBadge → Badge join)
    raw_badges = user_crud.get_user_badges(db, user.id)
    badges_out: List[BadgeInfo] = []
    for ub in raw_badges:
        b = ub.badge  # lazy-loaded via relationship
        badges_out.append(
            BadgeInfo(
                id=b.id,
                name=b.name,
                icon=b.icon,
                description=b.description,
            )
        )

    return UserProfile(
        id=user.id,
        username=user.username,
        display_name=user.display_name,
        bio=user.bio,
        avatar_url=user.avatar_url,
        author_tier=user.is_author,
        badges=badges_out,
        post_count=user_crud.get_approved_post_count(db, user.id),
        follower_count=user_crud.get_follower_count(db, user.id),
        following_count=user_crud.get_following_count(db, user.id),
        joined_at=user.created_at,
        privacy=user.profile_visibility.value if user.profile_visibility else "public",
    )


def _limited_profile(user: User) -> dict:
    """Return a reduced-info view for connections-only profiles seen by non-connections."""
    return {
        "id": str(user.id),
        "username": user.username,
        "display_name": user.display_name,
        "avatar_url": user.avatar_url,
        "privacy": user.profile_visibility.value if user.profile_visibility else "public",
        "restricted": True,
        "message": "This profile is visible to connections only.",
    }


# ─────────────────────────────────────────────────────────────────────────────
# GET /users/{username} — Public profile fetch
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/{username}", response_model=None)
def get_public_profile(
    username: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    """
    Fetch a user's public profile.

    Privacy enforcement:
    - public        → full profile to everyone
    - connections   → full profile only to confirmed connections or self; limited view otherwise
    - private       → 404 for everyone except self (avoids confirming account existence)
    """
    profile = user_crud.get_user_by_username(db, username)
    if not profile or profile.is_banned or not profile.is_active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")

    viewer_id = current_user.id if current_user else None
    is_self = viewer_id == profile.id
    visibility = profile.profile_visibility or ProfileVisibility.public

    if visibility == ProfileVisibility.public or is_self:
        return _build_profile_response(profile, db)

    if visibility == ProfileVisibility.connections_only:
        if not viewer_id:
            return _limited_profile(profile)
        is_connection = user_crud.check_is_connection(db, viewer_id, profile.id)
        if is_connection:
            return _build_profile_response(profile, db)
        return _limited_profile(profile)

    if visibility == ProfileVisibility.private:
        # Private — only the owner gets data; everyone else gets 404
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")


# ─────────────────────────────────────────────────────────────────────────────
# GET /users/{username}/posts — User post history
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/{username}/posts")
def get_user_posts(
    username: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    """
    Retrieve a user's public post history.
    Respects post-level visibility rules. Pagination via skip/limit.
    """
    profile = user_crud.get_user_by_username(db, username)
    if not profile or profile.is_banned or not profile.is_active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")

    # Honour profile privacy: if private and not self, return 404
    visibility = profile.profile_visibility or ProfileVisibility.public
    viewer_id = current_user.id if current_user else None
    is_self = viewer_id == profile.id

    if visibility == ProfileVisibility.private and not is_self:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")

    posts = user_crud.get_user_posts(
        db,
        user_id=profile.id,
        viewer_id=viewer_id,
        skip=skip,
        limit=limit,
    )

    # Return lightweight post summaries — the full post schema lives in M5
    return [
        {
            "id": str(p.id),
            "title": p.title,
            "post_type": p.post_type,
            "status": p.status,
            "created_at": p.created_at.isoformat(),
            "visibility": p.visibility,
        }
        for p in posts
    ]


# ─────────────────────────────────────────────────────────────────────────────
# PATCH /users/me — Update own profile
# ─────────────────────────────────────────────────────────────────────────────

@router.patch("/me", response_model=UserProfile)
def update_my_profile(
    payload: ProfileUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update the authenticated user's display name, bio, and/or privacy setting.
    Only provided fields are updated (partial update pattern).
    """
    updated = user_crud.update_profile(db, current_user, payload)
    return _build_profile_response(updated, db)


# ─────────────────────────────────────────────────────────────────────────────
# POST /users/me/avatar — Upload avatar image
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/me/avatar")
async def upload_my_avatar(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Upload a new avatar.
    - Accepts JPEG / PNG / WebP up to 5 MB.
    - Resizes to 400×400 and stores in MinIO.
    - Deletes the previous avatar from MinIO (best-effort).
    - Returns the new CDN URL.
    """
    old_url = current_user.avatar_url
    new_url = await user_service.upload_avatar(file, current_user.id)

    # Persist new URL to DB
    user_crud.update_avatar(db, current_user, new_url)

    # Best-effort cleanup of old avatar
    user_service.delete_old_avatar(old_url)

    return {"avatar_url": new_url}
