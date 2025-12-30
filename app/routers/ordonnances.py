from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schema, database

router = APIRouter(prefix="/ordonnances", tags=["Prescriptions"])

@router.post("/", response_model=schema.Ordonnance)
def creer_ordonnance(obj: schema.OrdonnanceCreate, db: Session = Depends(database.get_db)):
    nouvelle_ordonnance = models.Ordonnance(**obj.dict())
    db.add(nouvelle_ordonnance)
    db.commit()
    db.refresh(nouvelle_ordonnance)
    return nouvelle_ordonnance

@router.post("/{id_ordonnance}/medicaments")
def ajouter_medicaments(id_ordonnance: int, items: List[schema.PrescriptionMedCreate], db: Session = Depends(database.get_db)):
    for item in items:
        db_item = models.PrescrireMed(id_ordonnance=id_ordonnance, **item.dict())
        db.add(db_item)
    db.commit()
    return {"message": f"{len(items)} médicament(s) ajouté(s)"}

@router.get("/visite/{id_visite}")
def obtenir_ordonnance_visite(id_visite: int, db: Session = Depends(database.get_db)):
    return db.query(models.Ordonnance).filter(models.Ordonnance.id_visite == id_visite).first()

# --- Gestion du Référentiel Médicaments ---

@router.post("/referentiel-medicaments", response_model=schema.Medicament)
def creer_medicament_dans_dictionnaire(med: schema.MedicamentCreate, db: Session = Depends(database.get_db)):
    nouveau_med = models.Medicament(**med.dict())
    db.add(nouveau_med)
    db.commit()
    db.refresh(nouveau_med)
    return nouveau_med

@router.get("/referentiel-medicaments", response_model=list[schema.Medicament])
def lister_tous_les_medicaments(db: Session = Depends(database.get_db)):
    return db.query(models.Medicament).all()