from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.core.config import settings
from app.api.v1 import api_router


def rate_limit_key(request: Request) -> str:
    """Get rate limit key - use IP for unauthenticated, user ID for authenticated."""
    # Try to get user ID from token if present
    auth_header = request.headers.get("authorization")
    if auth_header and auth_header.startswith("Bearer "):
        # For authenticated routes, we could use user ID
        # But for simplicity, we'll use IP for all
        pass
    return get_remote_address(request)


limiter = Limiter(key_func=rate_limit_key)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize rate limiter with Redis
    from slowapi import _rate_limit_exceeded_handler
    from slowapi.errors import RateLimitExceeded
    
    # Connect to Redis for rate limiting
    import redis
    from app.core.config import settings
    
    if settings.REDIS_URL:
        app.state.limiter = limiter
        app.state._rate_limit_exceeded_handler = _rate_limit_exceeded_handler
        
    yield
    
    # Shutdown
    pass


app = FastAPI(
    title="YoTop10 API",
    description="Backend API for YoTop10 — the debate-first list platform",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    root_path="/api",
    lifespan=lifespan,
)

# Add rate limiter state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, lambda req, exc: JSONResponse(
    status_code=429,
    content={"detail": "Too many requests. Please try again later."}
))

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all API routes
app.include_router(api_router)


@app.get("/health")
def health_check():
    return {"status": "ok", "app": settings.APP_NAME}


@app.get("/")
def root():
    return {"message": "YoTop10 API is running"}
