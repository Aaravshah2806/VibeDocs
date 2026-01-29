from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import init_db
from app.routers import auth, repos, generate

# Initialize database
init_db()

# Create FastAPI app
app = FastAPI(
    title = "GitHub README AI API",
    description = "Backend API for AI-powered GitHub Readme generation",
    version = "1.0.0"
)

@app.on_event("startup")
async def startup_event():
    print("BACKEND RESTARTED - READY FOR REQUESTS", flush=True)

#Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(repos.router)
app.include_router(generate.router)

@app.get("/")
async def root():
    return{
        "message": "Welcome to VibeDocs AI",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}