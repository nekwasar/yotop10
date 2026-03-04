from datetime import datetime, timedelta
from typing import Optional
from uuid import UUID
from sqlalchemy.orm import Session
from app.models.session import Session as SessionModel


def create_session(
    db: Session,
    user_id: UUID,
    expires_days: int = 90,
    device_name: Optional[str] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
    token_fingerprint: Optional[str] = None,
) -> SessionModel:
    """Create a new session for a user."""
    session = SessionModel(
        user_id=user_id,
        device_name=device_name,
        ip_address=ip_address,
        user_agent=user_agent,
        token_fingerprint=token_fingerprint,
        expires_at=datetime.utcnow() + timedelta(days=expires_days),
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


def get_session_by_id(db: Session, session_id: UUID) -> Optional[SessionModel]:
    """Get a session by ID."""
    return db.query(SessionModel).filter(SessionModel.id == session_id).first()


def get_session_by_fingerprint(db: Session, user_id: UUID, fingerprint: str) -> Optional[SessionModel]:
    """Get an active session by user ID and token fingerprint."""
    return db.query(SessionModel).filter(
        SessionModel.user_id == user_id,
        SessionModel.token_fingerprint == fingerprint,
        SessionModel.is_revoked == False,
        SessionModel.expires_at > datetime.utcnow(),
    ).first()


def revoke_session(db: Session, session_id: UUID) -> bool:
    """Revoke a session by ID."""
    session = get_session_by_id(db, session_id)
    if session:
        session.is_revoked = True
        db.commit()
        return True
    return False


def revoke_all_user_sessions(db: Session, user_id: UUID) -> int:
    """Revoke all sessions for a user. Returns count of revoked sessions."""
    sessions = db.query(SessionModel).filter(
        SessionModel.user_id == user_id,
        SessionModel.is_revoked == False,
    ).all()
    count = len(sessions)
    for session in sessions:
        session.is_revoked = True
    db.commit()
    return count


def update_session_last_used(db: Session, session_id: UUID) -> None:
    """Update the last used timestamp for a session."""
    session = get_session_by_id(db, session_id)
    if session:
        session.last_used_at = datetime.utcnow()
        db.commit()


def cleanup_expired_sessions(db: Session) -> int:
    """Remove expired sessions from the database. Returns count of deleted sessions."""
    result = db.query(SessionModel).filter(
        SessionModel.expires_at < datetime.utcnow(),
    ).delete()
    db.commit()
    return result
