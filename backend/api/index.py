import sys
from pathlib import Path

# Ensure backend/ is in sys.path so imports like "from app.config" work
_root = str(Path(__file__).resolve().parent.parent)
if _root not in sys.path:
    sys.path.insert(0, _root)

from main import app
