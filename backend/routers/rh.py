from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schema, database

router = APIRouter(prefix="/rh", tags=["Gestion du Personnel"])

@router.post("/employer", response_model=schema.Employer)
def recruter_employer(obj: schema.EmployerCreate, db: Session = Depends(database.get_db)):
    nouveau = models.Employer(**obj.dict())
    db.add(nouveau)
    db.commit()
    db.refresh(nouveau)
    return nouveau

@router.post("/medecin", response_model=schema.Medecin)
def designer_medecin(obj: schema.MedecinCreate, db: Session = Depends(database.get_db)):
    nouveau = models.Medecin(**obj.dict())
    db.add(nouveau)
    db.commit()
    db.refresh(nouveau)
    return nouveau

@router.post("/conges", response_model=schema.DemandeConge)
def demander_conge(obj: schema.DemandeCongeCreate, db: Session = Depends(database.get_db)):
    nouvelle_demande = models.DemandeConge(**obj.dict())
    db.add(nouvelle_demande)
    db.commit()
    db.refresh(nouvelle_demande)
    return nouvelle_demande