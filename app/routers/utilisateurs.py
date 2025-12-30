from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

# Importations relatives
from .. import models, schema, database
from ..database import get_db

router = APIRouter(
    prefix="/utilisateurs",
    tags=["Gestion des Utilisateurs"]
)

# 1. Lister tous les utilisateurs
@router.get("/", response_model=List[schema.Utilisateur])
def get_all_users(db: Session = Depends(get_db)):
    # Utilisation de models.Utilisateur car importé via 'from .. import models'
    return db.query(models.Utilisateur).all()

# 2. Créer un utilisateur simple
@router.post("/")
def creer_utilisateur(utilisateur: schema.UtilisateurCreate, db: Session = Depends(get_db)):
    # .dict() est la méthode standard pour Python 3.9 / Pydantic v1
    nouvel_utilisateur = models.Utilisateur(**utilisateur.dict())
    
    db.add(nouvel_utilisateur)
    db.commit()
    db.refresh(nouvel_utilisateur)
    return nouvel_utilisateur

# 3. Créer un Patient
@router.post("/patient")
def creer_patient(donnees: schema.PatientCreate, db: Session = Depends(get_db)):
    # On sépare les données utilisateur des données patient
    infos_user = donnees.dict(exclude={'medecin_traitant', 'couverture_medicale'})
    nouvel_utilisateur = models.Utilisateur(**infos_user)
    
    db.add(nouvel_utilisateur)
    db.flush() 
    
    nouveau_patient = models.Patient(
        id_utilisateur=nouvel_utilisateur.id_utilisateur,
        medecin_traitant=donnees.medecin_traitant,
        couverture_medicale=donnees.couverture_medicale
    )
    
    db.add(nouveau_patient)
    db.commit()
    db.refresh(nouveau_patient)
    return nouveau_patient

# 4. Créer un Employé
@router.post("/employer")
def creer_employer(donnees: schema.EmployerCreate, db: Session = Depends(get_db)):
    champs_employer = {'role', 'salaire', 'statut'}
    
    # Création Utilisateur
    user_data = donnees.dict(exclude=champs_employer)
    nouvel_utilisateur = models.Utilisateur(**user_data)
    db.add(nouvel_utilisateur)
    db.flush() 
    
    # Création Employé
    emp_data = donnees.dict(include=champs_employer)
    employer = models.Employer(
        id_utilisateur=nouvel_utilisateur.id_utilisateur,
        **emp_data
    )
    db.add(employer)
    db.commit()
    db.refresh(employer)
    return employer

# 5. Créer un Médecin (3 niveaux)
@router.post("/employer/medecin")
def creer_medecin(donnees: schema.MedecinCreate, db: Session = Depends(get_db)):
    champs_medecin = {'specialite'}
    champs_employer = {'role', 'salaire', 'statut'}
    
    # Niveau 1 : Utilisateur
    user_data = donnees.dict(exclude=champs_medecin | champs_employer)
    nouvel_utilisateur = models.Utilisateur(**user_data)
    db.add(nouvel_utilisateur)
    db.flush()
    
    # Niveau 2 : Employer
    emp_data = donnees.dict(include=champs_employer)
    nouvel_employer = models.Employer(
        id_utilisateur=nouvel_utilisateur.id_utilisateur, 
        **emp_data
    )
    db.add(nouvel_employer)
    db.flush()
    
    # Niveau 3 : Medecin
    medecin = models.Medecin(
        id_employer=nouvel_employer.id_employer, 
        specialite=donnees.specialite
    )
    db.add(medecin)
    
    db.commit()
    db.refresh(medecin)
    return medecin