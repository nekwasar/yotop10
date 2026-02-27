import uuid
from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, UniqueConstraint, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum


class ReactionType(str, enum.Enum):
    fire = "fire"


class ReactionTargetType(str, enum.Enum):
    post = "post"
    list_item = "list_item"
    comment = "comment"


class Reaction(Base):
    __tablename__ = "reactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    target_type = Column(SAEnum(ReactionTargetType), nullable=False)
    target_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    reaction_type = Column(SAEnum(ReactionType), nullable=False, default=ReactionType.fire)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="reactions")

    __table_args__ = (
        UniqueConstraint("user_id", "target_type", "target_id", "reaction_type", name="uq_reaction_per_user"),
    )
