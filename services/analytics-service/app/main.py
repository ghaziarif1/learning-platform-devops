from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import Base, engine
from app.api.routes import events, dashboard

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Analytics Service",
    description="Suivi des vues, inscriptions et tendances",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(events.router)
app.include_router(dashboard.router)

@app.get("/health")
def health():
    return {"status": "OK", "service": "analytics-service"}