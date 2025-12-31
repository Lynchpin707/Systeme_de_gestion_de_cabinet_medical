from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schema, database

router = APIRouter(prefix="/clinique", tags=["Examen Clinique"])

# Créer un symptôme dans le dictionnaire
@router.post("/symptomes", response_model=schema.Symptome)
def creer_symptome(obj: schema.SymptomeCreate, db: Session = Depends(database.get_db)):
    nouveau = models.Symptome(**obj.dict())
    db.add(nouveau)
    db.commit()
    db.refresh(nouveau)
    return nouveau

# Associer des symptômes à une visite
@router.post("/visite/{id_visite}/detecter")
def noter_symptomes(id_visite: int, symptomes: List[schema.DetectionCreate], db: Session = Depends(database.get_db)):
    for item in symptomes:
        liaison = models.Detecter(id_visite=id_visite, **item.dict())
        db.add(liaison)
    db.commit()
    return {"message": f"{len(symptomes)} symptôme(s) enregistré(s) pour la visite {id_visite}"}