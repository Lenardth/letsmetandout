from fastapi import FastAPI
from app.routes import auth, users, emergency, safety, verification
from app.utils.database import engine, Base
from app.utils.security import get_current_user
from app.config import settings

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Social Safety API",
    description="Backend API for Social Safety Mobile App",
    version="1.0.0"
)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(emergency.router, prefix="/emergency", tags=["Emergency"])
app.include_router(safety.router, prefix="/safety", tags=["Safety"])
app.include_router(verification.router, prefix="/verification", tags=["Verification"])

@app.get("/")
def root():
    return {"message": "Social Safety API is running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
