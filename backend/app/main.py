from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.session import engine
from app.db.base import Base
from app.routers import hcps, interactions, agent

Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(hcps.router, prefix="/hcps", tags=["hcps"])
app.include_router(interactions.router, prefix="/interactions", tags=["interactions"])
app.include_router(agent.router, prefix="/agent", tags=["agent"])

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/health/db")
def health_db():
    try:
        engine.connect()
        return {"status": "ok"}
    except Exception as e:
        return {"status": "error", "detail": str(e)}
