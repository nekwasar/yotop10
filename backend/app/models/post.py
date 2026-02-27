import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Boolean, Integer, DateTime, Text,
    Enum as SAEnum, ForeignKey
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum


class PostType(str, enum.Enum):
    top_list = "top_list"
    this_vs_that = "this_vs_that"
    who_is_better = "who_is_better"
    fact_drop = "fact_drop"
    best_of = "best_of"
    worst_of = "worst_of"
    hidden_gems = "hidden_gems"
    counter_list = "counter_list"


class PostStatus(str, enum.Enum):
    draft = "draft"
    pending_review = "pending_review"
    approved = "approved"
    rejected = "rejected"
    hidden = "hidden"


class PostVisibility(str, enum.Enum):
    public = "public"
    connections_only = "connections_only"
    private = "private"


class VerdictStatus(str, enum.Enum):
    undecided = "undecided"
    confirmed = "confirmed"
    contested = "contested"
    hot_take = "hot_take"
    debunked = "debunked"


class PinType(str, enum.Enum):
    global_feed = "global_feed"
    community = "community"


class Post(Base):
    __tablename__ = "posts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    author_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(300), nullable=False)
    post_type = Column(SAEnum(PostType), nullable=False)
    status = Column(SAEnum(PostStatus), default=PostStatus.pending_review, nullable=False, index=True)
    visibility = Column(SAEnum(PostVisibility), default=PostVisibility.public, nullable=False)

    intro = Column(Text, nullable=True)
    is_sourced = Column(Boolean, default=False)

    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id"), nullable=True, index=True)
    counter_to_post_id = Column(UUID(as_uuid=True), ForeignKey("posts.id", ondelete="SET NULL"), nullable=True)

    verdict = Column(SAEnum(VerdictStatus), default=VerdictStatus.undecided)

    fire_count = Column(Integer, default=0, nullable=False)
    comment_count = Column(Integer, default=0, nullable=False)
    challenge_count = Column(Integer, default=0, nullable=False)
    rival_count = Column(Integer, default=0, nullable=False)

    edit_deadline = Column(DateTime, nullable=True)
    approved_at = Column(DateTime, nullable=True)
    rejected_reason = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    author = relationship("User", back_populates="posts", foreign_keys=[author_id])
    category = relationship("Category", back_populates="posts")
    list_items = relationship("ListItem", back_populates="post", order_by="ListItem.rank", cascade="all, delete-orphan")
    sources = relationship("PostSource", back_populates="post", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="post", cascade="all, delete-orphan")
    counter_lists = relationship("Post", foreign_keys=[counter_to_post_id])
    pinned = relationship("PinnedPost", back_populates="post", cascade="all, delete-orphan")
    communities = relationship("PostCommunity", back_populates="post", cascade="all, delete-orphan")


class PostSource(Base):
    __tablename__ = "post_sources"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    post_id = Column(UUID(as_uuid=True), ForeignKey("posts.id", ondelete="CASCADE"), nullable=False)
    label = Column(String(200), nullable=False)
    url = Column(String(1000), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    post = relationship("Post", back_populates="sources")


class PinnedPost(Base):
    __tablename__ = "pinned_posts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    post_id = Column(UUID(as_uuid=True), ForeignKey("posts.id", ondelete="CASCADE"), nullable=False)
    pinned_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    pin_type = Column(SAEnum(PinType), nullable=False)
    community_id = Column(UUID(as_uuid=True), ForeignKey("communities.id", ondelete="CASCADE"), nullable=True)
    pinned_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)

    post = relationship("Post", back_populates="pinned")


class PostCommunity(Base):
    __tablename__ = "post_communities"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    post_id = Column(UUID(as_uuid=True), ForeignKey("posts.id", ondelete="CASCADE"), nullable=False)
    community_id = Column(UUID(as_uuid=True), ForeignKey("communities.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    post = relationship("Post", back_populates="communities")
    community = relationship("Community", back_populates="posts")
