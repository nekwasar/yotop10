import uuid
from datetime import datetime
from sqlalchemy import Column, Integer, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base


class Comment(Base):
    __tablename__ = "comments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    post_id = Column(UUID(as_uuid=True), ForeignKey("posts.id", ondelete="CASCADE"), nullable=False, index=True)
    author_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    list_item_id = Column(UUID(as_uuid=True), ForeignKey("list_items.id", ondelete="SET NULL"), nullable=True, index=True)
    parent_comment_id = Column(UUID(as_uuid=True), ForeignKey("comments.id", ondelete="CASCADE"), nullable=True)
    depth = Column(Integer, default=0, nullable=False)
    content = Column(Text, nullable=False)
    fire_count = Column(Integer, default=0, nullable=False)
    is_hidden = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    post = relationship("Post", back_populates="comments")
    author = relationship("User", back_populates="comments")
    list_item = relationship("ListItem", back_populates="comments")
    parent = relationship("Comment", remote_side="Comment.id", back_populates="replies", foreign_keys=[parent_comment_id])
    replies = relationship("Comment", back_populates="parent", cascade="all, delete-orphan", foreign_keys=[parent_comment_id])
