from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from .. import database, models, auth
from ..schema import UtilisateurCreate

# Ajoutez le prefix ici pour fixer la 404
router = APIRouter(prefix="/auth", tags=['Authentification'])


@router.post('/login')
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = db.query(models.Utilisateur).filter(models.Utilisateur.email == form_data.username).first()
    
    if not user or not auth.verifier_password(form_data.password, user.mot_de_passe):
        raise HTTPException(status_code=401, detail="Identifiants incorrects")

    # --- Détection du rôle et des IDs spécifiques ---
    role = "utilisateur"
    id_lie = None

    # 1. Est-ce un Admin ?
    admin = db.query(models.Admin).filter(models.Admin.id_utilisateur == user.id_utilisateur).first()
    if admin:
        role = "admin"
        id_lie = admin.id_admin

    # 2. Sinon, est-ce un Patient ?
    else:
        patient = db.query(models.Patient).filter(models.Patient.id_utilisateur == user.id_utilisateur).first()
        if patient:
            role = "patient"
            id_lie = patient.id_patient
        
        # 3. Sinon, est-ce un Médecin ? (via la table Employer)
        else:
            medecin = db.query(models.Medecin).join(models.Employer).filter(
                models.Employer.id_utilisateur == user.id_utilisateur
            ).first()
            if medecin:
                role = "medecin"
                id_lie = medecin.id_medecin

    access_token = auth.creer_token_acces(data={"sub": user.email})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id_utilisateur,
            "id_specifique": id_lie, # Renvoie l'ID admin, patient ou medecin
            "nom_utilisateur": user.nom_utilisateur,
            "role": role
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