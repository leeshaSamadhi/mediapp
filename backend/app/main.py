"""
Vercel Serverless Function Bridge

This module serves as the bridge between Vercel's serverless function entry point
(api/index.py) and the main FastAPI application (backend/main.py).

Import chain for Vercel deployment:
  api/index.py → backend/app/main.py → backend/main.py

The sys.path manipulation ensures that backend/main.py can import
database.py and other modules from the backend/ directory.
"""
import sys
import os

# Add backend/ to sys.path so the main module's imports (e.g. database) work
_backend_dir = os.path.join(os.path.dirname(__file__), '..')
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

from main import app  # noqa: F401
