from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schema, database

router = APIRouter(prefix="/visites", tags=["Visites Médicales"])

@router.post("/rdv", response_model=schema.RDV)
def creer_rdv(rdv: schema.RDVCreate, db: Session = Depends(database.get_db)):
    # Vérifier si le patient existe
    patient = db.query(models.Patient).filter(models.Patient.id_patient == rdv.id_patient).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient non trouvé")

    nouvel_rdv = models.RDV(**rdv.dict())
    db.add(nouvel_rdv)
    db.commit()
    db.refresh(nouvel_rdv)
    return nouvel_rdv

@router.get("/rdv/aujourdhui", response_model=list[schema.RDV])
def rdv_du_jour(db: Session = Depends(database.get_db)):
    from datetime import date
    return db.query(models.RDV).filter(models.RDV.date_rdv == date.today()).all()

@router.post("/", response_model=schema.Visite)
def creer_visite(visite: schema.VisiteCreate, db: Session = Depends(database.get_db)):
    db_rdv = db.query(models.RDV).filter(models.RDV.id_RDV == visite.id_RDV).first()
    if not db_rdv:
        raise HTTPException(status_code=404, detail="RDV non trouvé")

    # Mise à jour du statut du RDV
    db_rdv.statut = "Effectué" 

    nouvelle_visite = models.Visite(**visite.dict())
    db.add(nouvelle_visite)
    db.commit()
    db.refresh(nouvelle_visite)
    return nouvelle_visite

