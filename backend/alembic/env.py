import sys
import os

from logging.config import fileConfig

from sqlalchemy import pool, MetaData

from alembic import context

from sqlalchemy import create_engine
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'app')))

from app.config import DATABASE_URL
from app.models import *
from app.database import Base
import logging
logging.basicConfig()
logger = logging.getLogger("alembic")
logger.setLevel(logging.INFO)
# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# add your model's MetaData object here
# for 'autogenerate' support
# from myapp import mymodel
# target_metadata = mymodel.Base.metadata
print("Metadata tables:", Base.metadata.tables.keys())
target_metadata = Base.metadata
print("=== Tables in metadata ===")
for table in target_metadata.tables:
    print(table)
print("==========================")
# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.


def run_migrations_offline() -> None:
    print("OFFLINE MODE")
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    url = config.get_main_option("sqlalchemy.url")

    def include_name(name, type_, parent_names):
        if type_ == "schema":
            # note this will not include the default schema
            return name in ["secura"]
        else:
            return True

    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        include_schemas=False,
        include_name=include_name,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    print("ONLINE MODE")

    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.

    """
    target_metadata.schema = "secura"

    # ↓ override the config and use your actual connection string
    connectable = create_engine(DATABASE_URL, poolclass=pool.NullPool)

    # connectable = engine_from_config(
    #     config.get_section(config.config_ini_section, {}),
    #     prefix="sqlalchemy.",
    #     poolclass=pool.NullPool,
    # )
    def include_object(object, name, type_, reflected, compare_to):
        excluded_tables = {
            # "assets", "asset_groups", "asset_relations", "asset_owners",
            # "asset_lifecycle_events", "asset_scans", "asset_maintenance",
            # "asset_security_profiles", "asset_types", "asset_tags", "asset_tags_links",
            # "persons","threats"
        }
        if type_ == "table" and name in excluded_tables:
            return False
        return True

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            include_object=include_object,
            compare_type=True,
            compare_server_default=True
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
