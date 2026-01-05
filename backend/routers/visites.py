from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import models, schema, database, auth
from datetime import date

router = APIRouter(prefix="/visites", tags=["Visites Médicales"])

from datetime import time, timedelta

@router.post("/rdv", response_model=schema.RDV)
def prendre_rdv(obj: schema.RDVCreate, db: Session = Depends(database.get_db)):
    # Heures d'ouverture (08:00 - 18:00)
    ouverture = time(8, 0)
    fermeture = time(18, 0)
    if obj.heure_rdv < ouverture or obj.heure_rdv > fermeture:
        raise HTTPException(status_code=400, detail="Le cabinet est fermé à cette heure.")

    # Disponibilité du médecin 
    conflit = db.query(models.RDV).filter(
        models.RDV.id_medecin == obj.id_medecin,
        models.RDV.date_rdv == obj.date_rdv,
        models.RDV.heure_rdv == obj.heure_rdv
    ).first()
    
    if conflit:
        raise HTTPException(status_code=400, detail="Ce créneau est déjà pris.")

   

    nouveau_rdv = models.RDV(**obj.dict())
    db.add(nouveau_rdv)
    db.commit()
    return nouveau_rdv

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

# --- Récupérer les RDV du patient connecté ---
@router.get("/mes-rdv", response_model=list[schema.RDV])
def obtenir_mes_rdv(id_patient: int, db: Session = Depends(database.get_db)):
    # On récupère tous les RDV, classés par date (du plus récent au plus ancien)
    return db.query(models.RDV).filter(
        models.RDV.id_patient == id_patient
    ).order_by(models.RDV.date_rdv.desc()).all()

# --- Récupérer l'historique des visites du patient ---
@router.get("/mes-visites", response_model=list[schema.Visite])
def obtenir_mes_visites(id_patient: int, db: Session = Depends(database.get_db)):
    # On cherche les visites liées aux RDV de ce patient
    return db.query(models.Visite).join(models.RDV).filter(
        models.RDV.id_patient == id_patient
    ).order_by(models.Visite.id_visite.desc()).all()
    
