import sys
import os

from starlette.middleware.base import BaseHTTPMiddleware

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))
from app.main import app


class StripApiPrefix(BaseHTTPMiddleware):
    """Strip the /api prefix from request paths so FastAPI routes match correctly."""
    async def dispatch(self, request, call_next):
        if request.url.path.startswith('/api'):
            request.scope['path'] = request.url.path[4:] or '/'
        return await call_next(request)


app.add_middleware(StripApiPrefix)