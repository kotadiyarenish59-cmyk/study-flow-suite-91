from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import auth, subjects, tasks, stats
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API for Study Deckboard student study management web app",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# તમામ Origin, Headers અને Methods અલાઉ કરો
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
api_v1_prefix = settings.API_V1_STR
app.include_router(auth.router, prefix=api_v1_prefix)
app.include_router(subjects.router, prefix=api_v1_prefix)
app.include_router(tasks.router, prefix=api_v1_prefix)
app.include_router(stats.router, prefix=api_v1_prefix)

@app.get("/", tags=["Health Check"])
def root():
    return {
        "status": "online",
        "app_name": settings.PROJECT_NAME,
        "docs": "/docs"
    }