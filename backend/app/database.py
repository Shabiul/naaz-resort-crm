import os
import shutil
from pathlib import Path
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker, declarative_base

from app.config import settings

_DB_URL = settings.DATABASE_URL

# On Vercel (or any read-only filesystem), copy DB to /tmp and use that path
if "VERCEL" in os.environ:
    src_db = None
    if _DB_URL.startswith("sqlite:///"):
        path_part = _DB_URL[len("sqlite:///"):]
        p = Path(path_part)
        if p.exists() and p.is_file():
            src_db = p
        else:
            # Try relative to project root
            alt = Path(__file__).resolve().parent.parent / path_part
            if alt.exists():
                src_db = alt

    if src_db:
        tmp_path = "/tmp/naaz_resort.db"
        if not os.path.exists(tmp_path):
            shutil.copy2(str(src_db), tmp_path)
        _DB_URL = f"sqlite:///{tmp_path}"

engine = create_engine(
    _DB_URL,
    connect_args={"check_same_thread": False} if "sqlite" in _DB_URL else {},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# New columns added to existing tables after their initial creation. SQLite's
# create_all() won't ALTER existing tables, so we add missing columns here.
# Idempotent: only adds a column when it isn't already present.
_COLUMN_MIGRATIONS = {
    "event_inquiries": {
        "venue_id": "INTEGER",
        "quoted_amount": "FLOAT DEFAULT 0",
    },
    "users": {
        "phone": "VARCHAR(50) DEFAULT ''",
    },
}


def _run_column_migrations():
    inspector = inspect(engine)
    existing_tables = set(inspector.get_table_names())
    with engine.begin() as conn:
        for table, columns in _COLUMN_MIGRATIONS.items():
            if table not in existing_tables:
                continue
            existing_columns = {c["name"] for c in inspector.get_columns(table)}
            for column, ddl in columns.items():
                if column not in existing_columns:
                    conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {column} {ddl}"))


def init_db():
    Base.metadata.create_all(bind=engine)
    _run_column_migrations()
