from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from .. import database, models, auth
from ..schema import UtilisateurCreate

# Ajoutez le prefix ici pour fixer la 404
router = APIRouter(prefix="/auth", tags=['Authentification'])

# Dans app/routers/auth.py

@router.post('/login')
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = db.query(models.Utilisateur).filter(models.Utilisateur.email == form_data.username).first()
    
    if not user or not auth.verifier_password(form_data.password, user.mot_de_passe):
        raise HTTPException(status_code=401, detail="Identifiants incorrects")

    # --- CRITIQUE : Trouver l'ID patient lié ---
    patient = db.query(models.Patient).filter(models.Patient.id_utilisateur == user.id_utilisateur).first()
    id_patient = patient.id_patient if patient else None

    access_token = auth.creer_token_acces(data={"sub": user.email})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id_utilisateur,
            "id_patient": id_patient, # <-- C'est cette ligne qui manque !
            "nom_utilisateur": user.nom_utilisateur,
            "role": "patient" if id_patient else "employee"
        }
    }
    
@router.post("/register")
def register(user_in: UtilisateurCreate, db: Session = Depends(database.get_db)):

    nouvel_utilisateur = models.Utilisateur(
        nom_utilisateur=user_in.nom_utilisateur,
        email=user_in.email,
        mot_de_passe=auth.hacher_password(user_in.mot_de_passe)
        
    )
    db.add(nouvel_utilisateur)
    db.commit()
    db.refresh(nouvel_utilisateur)

    nouveau_patient = models.Patient(
        id_utilisateur=nouvel_utilisateur.id_utilisateur,
        couverture_medicale="Aucune" 
    )
    db.add(nouveau_patient)
    db.commit()

    return {
        "user": {
            "nom_utilisateur": nouvel_utilisateur.nom_utilisateur,
            "email": nouvel_utilisateur.email,
            "role": "patient"
        }
    }