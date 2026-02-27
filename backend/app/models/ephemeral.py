import uuid
from datetime import datetime
from sqlalchemy import Column, Boolean, Integer, DateTime, Text, ForeignKey, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum


class BurnMode(str, enum.Enum):
    after_response = "after_response"
    before_seen = "before_seen"


class EphemeralThread(Base):
    __tablename__ = "ephemeral_threads"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    community_id = Column(UUID(as_uuid=True), ForeignKey("communities.id", ondelete="CASCADE"), nullable=False)
    creator_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    burn_mode = Column(SAEnum(BurnMode), nullable=False)
    burn_after_minutes = Column(Integer, nullable=False)
    is_burned = Column(Boolean, default=False, nullable=False)
    burned_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    community = relationship("Community", back_populates="ephemeral_threads")
    creator = relationship("User")
    participants = relationship("EphemeralThreadParticipant", back_populates="thread", cascade="all, delete-orphan")
    messages = relationship("EphemeralThreadMessage", back_populates="thread", cascade="all, delete-orphan")


class EphemeralThreadParticipant(Base):
    __tablename__ = "ephemeral_thread_participants"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    thread_id = Column(UUID(as_uuid=True), ForeignKey("ephemeral_threads.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    has_seen = Column(Boolean, default=False)
    seen_at = Column(DateTime, nullable=True)
    joined_at = Column(DateTime, default=datetime.utcnow)

    thread = relationship("EphemeralThread", back_populates="participants")
    user = relationship("User")


class EphemeralThreadMessage(Base):
    __tablename__ = "ephemeral_thread_messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    thread_id = Column(UUID(as_uuid=True), ForeignKey("ephemeral_threads.id", ondelete="CASCADE"), nullable=False)
    author_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    thread = relationship("EphemeralThread", back_populates="messages")
    author = relationship("User")
