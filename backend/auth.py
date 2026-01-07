from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from . import  models
from backend import database

# !!!! Change
SECRET_KEY = "VOTRE_CLE_TRES_SECRETE"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# --- Utilitaires de mot de passe ---
def verifier_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def hacher_password(password):
    return pwd_context.hash(password)

# --- Gestion des Tokens ---
def creer_token_acces(data: dict):
    a_encoder = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    a_encoder.update({"exp": expire})
    return jwt.encode(a_encoder, SECRET_KEY, algorithm=ALGORITHM)

# --- Dépendance pour sécuriser les routes ---
def get_utilisateur_actuel(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Identifiants invalides",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(models.Utilisateur).filter(models.Utilisateur.email == email).first()
    if user is None:
        raise credentials_exception
    return user

def verifier_role(roles_autorises: list):

    def role_checker(current_user: models.Utilisateur = Depends(get_utilisateur_actuel)):

        # On récupère le rôle via la relation avec Employer

        if not current_user.employer or current_user.employer.role not in roles_autorises:

            raise HTTPException(

        status_code=status.HTTP_403_FORBIDDEN,

        detail="Vous n'avez pas les permissions nécessaires (Rôle requis: " + str(roles_autorises) + ")"

        )

        return current_user

    return role_checker


def verifier_role_admin():
    def role_checker(current_user: models.Utilisateur = Depends(get_utilisateur_actuel), db: Session = Depends(database.get_db)):
        print(f"--- DEBUG AUTH ---")
        print(f"ID Utilisateur connecté: {current_user.id_utilisateur}")
        
        # On vérifie l'existence dans la table admin
        admin_record = db.query(models.Admin).filter(models.Admin.id_utilisateur == current_user.id_utilisateur).first()
        
        if not admin_record:
            print(f"ERREUR: L'ID {current_user.id_utilisateur} n'existe pas dans la table ADMIN")
            # Liste des IDs admin pour comparer
            all_admins = db.query(models.Admin.id_utilisateur).all()
            print(f"IDs presents dans la table Admin: {all_admins}")
            
            raise HTTPException(status_code=403, detail="Accès réservé : ID non trouvé dans la table Admin")
        
        print("DEBUG: Accès autorisé !")
        return current_user
    return role_checker