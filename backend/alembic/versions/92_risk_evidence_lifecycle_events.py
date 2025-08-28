"""create evidence_lifecycle_events table

Revision ID: 92_risk_evidence_lifecycle_events
Revises: 91e183c42761
Create Date: 2025-08-28 22:20:30

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = '92evidlifecycle'
down_revision = '91e183c42761'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'evidence_lifecycle_events',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('evidence_id', sa.Integer(), sa.ForeignKey('control_evidence.id', ondelete='CASCADE'), nullable=False),
        sa.Column('event', sa.String(length=50), nullable=False),
        sa.Column('actor_id', sa.Integer(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('meta', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
    )
    op.create_index('ix_evidence_lifecycle_events_evidence_id_created_at', 'evidence_lifecycle_events', ['evidence_id', 'created_at'])


def downgrade() -> None:
    op.drop_index('ix_evidence_lifecycle_events_evidence_id_created_at', table_name='evidence_lifecycle_events')
    op.drop_table('evidence_lifecycle_events')
