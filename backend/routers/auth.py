from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from .. import database, models, auth

router = APIRouter(tags=['Authentification'])

@router.post('/login')
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    # 1. Chercher l'utilisateur
    user = db.query(models.Utilisateur).filter(models.Utilisateur.email == form_data.username).first()
    
    # 2. Vérifier mot de passe
    if not user or not auth.verifier_password(form_data.password, user.mot_de_passe):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Email ou mot de passe incorrect")

    # 3. Générer le token
    access_token = auth.creer_token_acces(data={"sub": user.email})
    
    return {"access_token": access_token, "token_type": "bearer"}