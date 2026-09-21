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

# Render Environment માંથી લિસ્ટ લેશે અને સાથે Vercel/Localhost બંનેને પરવાનગી આપશે
origins = [
    "https://study-flow-suite-91.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000",
]

# જો Render માં CORS_ORIGINS સેટ હોય તો તેને પણ ઉમેરી દેશે
if hasattr(settings, "CORS_ORIGINS") and settings.CORS_ORIGINS:
    if isinstance(settings.CORS_ORIGINS, list):
        origins.extend(settings.CORS_ORIGINS)
    elif isinstance(settings.CORS_ORIGINS, str):
        origins.extend([origin.strip() for origin in settings.CORS_ORIGINS.split(",") if origin.strip()])

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(set(origins)),
    allow_origin_regex=r"^https:\/\/.*\.vercel\.app$",
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