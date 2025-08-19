"""
SafeMeet FastAPI Application
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.utils.database import engine, Base
from app.routes import auth, users, verification, emergency, safety


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    print(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    
    # Create database tables
    Base.metadata.create_all(bind=engine)
    
    yield
    
    # Shutdown
    print("Shutting down SafeMeet API")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="South Africa's safest social meetup platform API",
    lifespan=lifespan,
    debug=settings.DEBUG
)

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["*"],
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"] if settings.DEBUG else ["safemeet.co.za", "api.safemeet.co.za"]
)

# Routes
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
app.include_router(verification.router, prefix="/api/v1/verification", tags=["Verification"])
app.include_router(emergency.router, prefix="/api/v1/emergency", tags=["Emergency"])
app.include_router(safety.router, prefix="/api/v1/safety", tags=["Safety"])


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": f"Welcome to {settings.APP_NAME} API",
        "version": settings.APP_VERSION,
        "status": "healthy"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": settings.APP_VERSION
    }