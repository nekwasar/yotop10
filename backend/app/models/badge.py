import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base


class Badge(Base):
    __tablename__ = "badges"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), unique=True, nullable=False)
    slug = Column(String(100), unique=True, nullable=False)
    description = Column(String(300), nullable=False)
    icon = Column(String(10), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user_badges = relationship("UserBadge", back_populates="badge")


class UserBadge(Base):
    __tablename__ = "user_badges"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    badge_id = Column(UUID(as_uuid=True), ForeignKey("badges.id"), nullable=False)
    awarded_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    awarded_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="badges", foreign_keys=[user_id])
    badge = relationship("Badge", back_populates="user_badges")
