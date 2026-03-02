"""add email_verify_code columns to users table

Revision ID: a1b2c3d4e5f6
Revises: 37bc7308e50c
Create Date: 2026-03-02 14:30:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'a1b2c3d4e5f6'
down_revision = '37bc7308e50c'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add 6-digit OTP columns for email verification (replaces old token-based flow)
    op.add_column('users', sa.Column('email_verify_code', sa.String(6), nullable=True))
    op.add_column('users', sa.Column('email_verify_code_expires', sa.DateTime(), nullable=True))


def downgrade() -> None:
    op.drop_column('users', 'email_verify_code_expires')
    op.drop_column('users', 'email_verify_code')
