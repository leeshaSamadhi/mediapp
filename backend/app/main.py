import sys
import os

# Add backend/ to sys.path so the main module's imports (e.g. database) work
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from main import app  # noqa: F401