import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Boolean, Integer, DateTime,
    Enum as SAEnum, Text, ForeignKey
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum


class AuthProvider(str, enum.Enum):
    email = "email"
    google = "google"
    anonymous = "anonymous"


class ThemePreference(str, enum.Enum):
    futuristic = "futuristic"
    retro = "retro"


class ColorMode(str, enum.Enum):
    dark = "dark"
    light = "light"


class ProfileVisibility(str, enum.Enum):
    public = "public"
    connections_only = "connections_only"
    private = "private"


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(50), unique=True, nullable=False, index=True)
    display_name = Column(String(100), nullable=False)

    # Auth
    email = Column(String(255), unique=True, nullable=True, index=True)
    hashed_password = Column(String(255), nullable=True)
    google_id = Column(String(255), unique=True, nullable=True)
    auth_provider = Column(SAEnum(AuthProvider), nullable=False, default=AuthProvider.email)
    is_anonymous = Column(Boolean, default=False, nullable=False)
    device_fingerprint = Column(String(255), nullable=True)

    # Email verification
    is_verified = Column(Boolean, default=False, nullable=False)
    email_verify_token = Column(String(255), nullable=True)
    email_verify_token_expires = Column(DateTime, nullable=True)

    # Password reset
    reset_password_token = Column(String(255), nullable=True)
    reset_password_token_expires = Column(DateTime, nullable=True)

    # Profile
    avatar_url = Column(String(500), nullable=True)
    bio = Column(Text, nullable=True)
    custom_profile_html = Column(Text, nullable=True)
    custom_profile_css = Column(Text, nullable=True)

    # Preferences
    theme_preference = Column(SAEnum(ThemePreference), default=ThemePreference.futuristic)
    color_mode = Column(SAEnum(ColorMode), default=ColorMode.dark)
    profile_visibility = Column(SAEnum(ProfileVisibility), default=ProfileVisibility.public)
    post_default_visibility = Column(SAEnum(ProfileVisibility), default=ProfileVisibility.public)
    email_digest_opt_in = Column(Boolean, default=True)

    # Author tier
    is_author = Column(Boolean, default=False, nullable=False)
    approved_post_count = Column(Integer, default=0, nullable=False)

    # Roles
    is_admin = Column(Boolean, default=False, nullable=False)

    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    is_suspended = Column(Boolean, default=False, nullable=False)
    suspension_until = Column(DateTime, nullable=True)
    is_banned = Column(Boolean, default=False, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    posts = relationship("Post", back_populates="author", foreign_keys="Post.author_id")
    comments = relationship("Comment", back_populates="author")
    reactions = relationship("Reaction", back_populates="user")
    following = relationship("Follow", back_populates="follower", foreign_keys="Follow.follower_id")
    followers = relationship("Follow", back_populates="following", foreign_keys="Follow.following_id")
    sent_connections = relationship("Connection", back_populates="requester", foreign_keys="Connection.requester_id")
    received_connections = relationship("Connection", back_populates="receiver", foreign_keys="Connection.receiver_id")
    badges = relationship("UserBadge", back_populates="user", foreign_keys="UserBadge.user_id")
    strikes = relationship("Strike", back_populates="user", foreign_keys="Strike.user_id")
    community_memberships = relationship("CommunityMember", back_populates="user")
