import os
import shutil
from pathlib import Path
from sqlalchemy import create_engine
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


def init_db():
    Base.metadata.create_all(bind=engine)
