"""update user model with role and projects

Revision ID: xxx
Revises: previous_revision
Create Date: 2024-xx-xx

"""
from alembic import op
import sqlalchemy as sa
from app.models.enums import UserRole

def upgrade():
    # Add new columns to users table
    op.add_column('users', sa.Column('full_name', sa.String(255), nullable=True))
    op.add_column('users', sa.Column('role', sa.String(), 
                                    nullable=False, 
                                    server_default=UserRole.ANALYST))

    # Create user_projects table
    op.create_table(
        'user_projects',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('project', sa.String(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # Create index on user_projects
    op.create_index(op.f('ix_user_projects_id'), 'user_projects', ['id'], unique=False)

def downgrade():
    # Remove user_projects table
    op.drop_index(op.f('ix_user_projects_id'), table_name='user_projects')
    op.drop_table('user_projects')

    # Remove new columns from users table
    op.drop_column('users', 'role')
    op.drop_column('users', 'full_name') 