import os
import uvicorn
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base, SessionLocal
import models
from seed import seed_database
from routers import auth_router, employees_router, users_router, audit_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables and seed initial data if needed
    print("==> Initializing AuraTech Relational Database...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield
    # Shutdown
    print("==> Shutting down AuraTech FastAPI Backend.")


app = FastAPI(
    title="AuraTech ERP - HR & Authentication API",
    description="Enterprise HR & Employee Management linked with Authentication & Role-Based Access Control",
    version="4.8.0",
    lifespan=lifespan,
)

# Configure CORS
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers under /api prefix
app.include_router(auth_router.router, prefix="/api")
app.include_router(employees_router.router, prefix="/api")
app.include_router(users_router.router, prefix="/api")
app.include_router(audit_router.router, prefix="/api")


@app.get("/", tags=["Health"])
def root():
    return {
        "service": "AuraTech ERP HR & Authentication Backend",
        "version": "4.8.0",
        "status": "ONLINE",
        "documentation": "/docs",
        "api_prefix": "/api",
    }


@app.get("/health", tags=["Health"])
@app.get("/api/health", tags=["Health"])
def health_check():
    return {"status": "ok", "service": "HEALTHY", "database": "CONNECTED", "engine": "FastAPI + SQLite (Relational)"}


if __name__ == "__main__":
    port = int(os.getenv("FASTAPI_PORT", 8001))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
