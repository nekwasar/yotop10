from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

app = FastAPI(
    title="YoTop10 API",
    description="Backend API for YoTop10 — the debate-first list platform",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    root_path="/api",   # Tells FastAPI it's mounted at /api via Traefik
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "ok", "app": settings.APP_NAME}


@app.get("/")
def root():
    return {"message": "YoTop10 API is running"}
