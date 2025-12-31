from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schema, database
from ..auth import get_utilisateur_actuel

router = APIRouter(prefix="/dossier_medical", tags=["Dossier Médical"])

@router.post("/", response_model=schema.DossierMedical)
def creer_dossier(obj: schema.DossierMedicalCreate, db: Session = Depends(database.get_db)):
    # Vérifier si le dossier existe déjà pour ce patient
    existant = db.query(models.DossierMedical).filter(models.DossierMedical.id_patient == obj.id_patient).first()
    if existant:
        raise HTTPException(status_code=400, detail="Le dossier existe déjà")
    
    nouveau_dossier = models.DossierMedical(**obj.dict())
    db.add(nouveau_dossier)
    db.commit()
    db.refresh(nouveau_dossier)
    return nouveau_dossier

@router.post("/{id_dossier}/allergies")
def ajouter_allergie(id_dossier: int, allergie: schema.AjoutAllergie, db: Session = Depends(database.get_db)):
    liaison = models.ContientAllerg(id_dossier=id_dossier, **allergie.dict())
    db.add(liaison)
    db.commit()
    return {"message": "Allergie ajoutée au dossier"}

@router.get("/{id_patient}", response_model=schema.DossierMedical)
def obtenir_dossier(id_patient: int, db: Session = Depends(database.get_db)):
    dossier = db.query(models.DossierMedical).filter(models.DossierMedical.id_patient == id_patient).first()
    if not dossier:
        raise HTTPException(status_code=404, detail="Dossier non trouvé")
    return dossier

router = APIRouter(prefix="/dossiers", tags=["Dossier Médical"])

@router.get("/{id_patient}")
def obtenir_dossier(
    id_patient: int, 
    db: Session = Depends(database.get_db),
    current_user: models.Utilisateur = Depends(get_utilisateur_actuel) # Route protégée
):
    # 1. Récupérer le dossier
    dossier = db.query(models.DossierMedical).filter(models.DossierMedical.id_patient == id_patient).first()
    
    # 2. Vérifier si l'utilisateur est un médecin
    medecin = db.query(models.Medecin).filter(models.Medecin.id_employer == current_user.employer.id_employer).first()
    
    if not medecin:
        raise HTTPException(status_code=403, detail="Accès réservé au personnel médical")

    # 3. RÈGLE DE GESTION : Est-ce le médecin traitant ?
    patient = db.query(models.Patient).filter(models.Patient.id_patient == id_patient).first()
    if patient.medecin_traitant != medecin.id_medecin:
        raise HTTPException(status_code=403, detail="Vous n'êtes pas le médecin traitant de ce patient")

    return dossier