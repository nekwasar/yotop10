import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, Integer, DateTime, Text, ForeignKey, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum


class ReportTargetType(str, enum.Enum):
    post = "post"
    comment = "comment"


class ReportStatus(str, enum.Enum):
    pending = "pending"
    dismissed = "dismissed"
    actioned = "actioned"


class StrikeConsequence(str, enum.Enum):
    warning = "warning"
    suspension = "suspension"
    ban = "ban"


class AutoHideRuleType(str, enum.Enum):
    report_threshold = "report_threshold"
    keyword_filter = "keyword_filter"
    anonymous_spam = "anonymous_spam"
    new_user_rate = "new_user_rate"
    engagement_anomaly = "engagement_anomaly"


class Report(Base):
    __tablename__ = "reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    reporter_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    target_type = Column(SAEnum(ReportTargetType), nullable=False)
    target_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    community_id = Column(UUID(as_uuid=True), ForeignKey("communities.id", ondelete="SET NULL"), nullable=True)
    reason = Column(Text, nullable=False)
    status = Column(SAEnum(ReportStatus), default=ReportStatus.pending, nullable=False, index=True)
    resolved_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    reporter = relationship("User", foreign_keys=[reporter_id])
    resolver = relationship("User", foreign_keys=[resolved_by])


class Strike(Base):
    __tablename__ = "strikes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    issued_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    reason = Column(Text, nullable=False)
    strike_number = Column(Integer, nullable=False)
    consequence = Column(SAEnum(StrikeConsequence), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="strikes", foreign_keys=[user_id])
    issuer = relationship("User", foreign_keys=[issued_by])


class AutoHideRule(Base):
    __tablename__ = "auto_hide_rules"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    rule_type = Column(SAEnum(AutoHideRuleType), unique=True, nullable=False)
    is_enabled = Column(Boolean, default=True, nullable=False)
    config = Column(JSONB, nullable=False, default=dict)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
