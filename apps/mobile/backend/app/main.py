"""
Main FastAPI application for SafeMeet backend
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routes.auth import router as auth_router
from app.routes.users import router as users_router
from app.routes.verification import router as verification_router
from app.routes.emergency import router as emergency_router
from app.routes.safety import router as safety_router

app = FastAPI(title=settings.APP_NAME, version=settings.APP_VERSION)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(users_router, prefix="/api/v1/users", tags=["Users"])
app.include_router(verification_router, prefix="/api/v1/verification", tags=["Verification"])
app.include_router(emergency_router, prefix="/api/v1/emergency", tags=["Emergency"])
app.include_router(safety_router, prefix="/api/v1/safety", tags=["Safety"])

@app.get("/")
async def root():
    return {"message": f"Welcome to {settings.APP_NAME} API", "version": settings.APP_VERSION}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}