"""update user model with role and projects

Revision ID: da5f963f4dbb
Revises: 3f24fd29df73
Create Date: 2024-01-06 16:13:05.567158+00:00

"""
from alembic import op
import sqlalchemy as sa
from app.models.enums import UserRole

# revision identifiers, used by Alembic.
revision = 'da5f963f4dbb'
down_revision = '3f24fd29df73'
branch_labels = None
depends_on = None

def upgrade():
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    tables = inspector.get_table_names()

    # Add columns as nullable first
    op.add_column('users', sa.Column('full_name', sa.String(length=255), nullable=True))
    op.add_column('users', sa.Column('role', sa.String(), nullable=True))

    # Update existing records with default values
    conn.execute(sa.text("""
        UPDATE users 
        SET full_name = username || ' bin/binti User',
            role = :role 
        WHERE full_name IS NULL
    """), {"role": UserRole.ANALYST})

    # Now make the columns non-nullable
    op.alter_column('users', 'full_name',
        existing_type=sa.String(length=255),
        nullable=False
    )
    op.alter_column('users', 'role',
        existing_type=sa.String(),
        nullable=False,
        server_default=UserRole.ANALYST
    )

    # Create user_projects table if it doesn't exist
    if 'user_projects' not in tables:
        op.create_table('user_projects',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('user_id', sa.Integer(), nullable=False),
            sa.Column('project', sa.String(), nullable=False),
            sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_user_projects_id'), 'user_projects', ['id'], unique=False)
    else:
        # If table exists, we might want to update its structure
        # Check if columns exist and add them if they don't
        columns = [col['name'] for col in inspector.get_columns('user_projects')]
        
        if 'id' not in columns:
            op.add_column('user_projects', sa.Column('id', sa.Integer(), nullable=False))
            op.create_primary_key('pk_user_projects', 'user_projects', ['id'])
        
        if 'project' not in columns:
            op.add_column('user_projects', sa.Column('project', sa.String(), nullable=False))

def downgrade():
    # Remove user_projects table
    op.drop_index(op.f('ix_user_projects_id'), table_name='user_projects')
    op.drop_table('user_projects')

    # Remove columns from users table
    op.drop_column('users', 'role')
    op.drop_column('users', 'full_name')
