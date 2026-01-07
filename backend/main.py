from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database import engine
from backend import models
from backend.routers import utilisateurs, visites, facturation, catalogue, dossier_medical, ordonnances, clinique, rh, stats, patients
from backend.routers import auth



models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Cabinet Médical API")

# Configuration CORS 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(utilisateurs.router)
app.include_router(visites.router)
app.include_router(facturation.router)
app.include_router(catalogue.router)
app.include_router(dossier_medical.router)
app.include_router(ordonnances.router)
app.include_router(rh.router)
app.include_router(clinique.router)
app.include_router(stats.router)
app.include_router(patients.router)

@app.get("/")
def read_root():
    return {"status": "API is running", "docs": "/docs"}