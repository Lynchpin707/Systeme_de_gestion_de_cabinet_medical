from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schema, database

router = APIRouter(prefix="/patients", tags=["Patients"])

@router.get("/{id_patient}/medecin") # Retirez temporairement le response_model
def obtenir_medecin_traitant(id_patient: int, db: Session = Depends(database.get_db)):
    patient = db.query(models.Patient).filter(models.Patient.id_patient == id_patient).first()
    if not patient:
        return {"error": "Patient non trouvé"}
    
    medecin = db.query(models.Medecin).filter(models.Medecin.id_medecin == patient.medecin_traitant).first()
    
    if not medecin:
        return {"error": "Medecin non trouvé en base"}
    
    user_medecin = db.query(models.Utilisateur).join(models.Employer).filter(
        models.Employer.id_employer == medecin.id_employer
    ).first()
        
    return {
        "id_medecin": medecin.id_medecin,
        "specialite": medecin.specialite,
        "nom": user_medecin.nom_utilisateur if user_medecin else "Nom inconnu",
        "email": user_medecin.email if user_medecin else "N/A",
        "telephone": user_medecin.numero_tl if user_medecin else "N/A"
    }

@router.get("/{id_patient}/derniere-visite")
def obtenir_derniere_visite(id_patient: int, db: Session = Depends(database.get_db)):
    derniere_v = db.query(models.Visite).join(models.RDV).filter(
        models.RDV.id_patient == id_patient
    ).order_by(models.Visite.id_visite.desc()).first()
    return {"delaiControle": 999 if not derniere_v else 15}

@router.get("/")
def lister_patients(db: Session = Depends(database.get_db)):
    # Jointure entre Patient et Utilisateur
    resultats = db.query(models.Patient, models.Utilisateur).join(
        models.Utilisateur, 
        models.Patient.id_utilisateur == models.Utilisateur.id_utilisateur
    ).all()
    
    # Transformation en dictionnaire propre
    liste_patients = []
    for patient, user in resultats:
        liste_patients.append({
            "id_utilisateur": user.id_utilisateur,
            "id_patient": patient.id_patient,
            "nom_utilisateur": user.nom_utilisateur,
            "email": user.email,
            "numero_tl": user.numero_tl,
            "couverture_medicale": patient.couverture_medicale,
            "medecin_traitant": patient.medecin_traitant
        })
    
    return liste_patients