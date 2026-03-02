from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional, List
from app.models.user import ProfileVisibility


class BadgeInfo(BaseModel):
    id: UUID
    name: str
    icon: str
    description: str

    class Config:
        from_attributes = True


class UserProfile(BaseModel):
    id: UUID
    username: str
    display_name: str
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    author_tier: bool
    badges: List[BadgeInfo] = []
    post_count: int = 0
    follower_count: int = 0
    following_count: int = 0
    joined_at: datetime
    privacy: str

    class Config:
        from_attributes = True


class ProfileUpdateRequest(BaseModel):
    display_name: Optional[str] = Field(None, max_length=50)
    bio: Optional[str] = Field(None, max_length=300)
    privacy: Optional[ProfileVisibility] = None
