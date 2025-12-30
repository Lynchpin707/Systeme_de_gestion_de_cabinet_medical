from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schema, database

router = APIRouter(
    prefix="/catalogue",
    tags=["Catalogue et Tarifs"]
)

# --- Endpoints Actes ---
@router.post("/actes", response_model=schema.ActeMedical)
def creer_acte(acte: schema.ActeMedicalCreate, db: Session = Depends(database.get_db)):
    db_acte = models.ActeMedical(**acte.dict())
    db.add(db_acte)
    db.commit()
    db.refresh(db_acte)
    return db_acte

@router.get("/actes", response_model=List[schema.ActeMedical])
def lister_actes(db: Session = Depends(database.get_db)):
    return db.query(models.ActeMedical).all()

# --- Endpoints Catalogue/Prix ---
@router.post("/", response_model=schema.Catalogue)
def creer_catalogue(cat: schema.CatalogueCreate, db: Session = Depends(database.get_db)):
    db_cat = models.Catalogue(**cat.dict())
    db.add(db_cat)
    db.commit()
    db.refresh(db_cat)
    return db_cat

@router.post("/tarifer", response_model=schema.Tarifier)
def fixer_prix(tarif: schema.TarifierCreate, db: Session = Depends(database.get_db)):
    db_tarif = models.Tarifier(**tarif.dict())
    db.add(db_tarif)
    db.commit()
    db.refresh(db_tarif)
    return db_tarif

@router.get("/prix", response_model=List[schema.Tarifier])
def lister_prix(db: Session = Depends(database.get_db)):
    return db.query(models.Tarifier).all()