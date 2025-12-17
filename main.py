from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Utilisateur
from app.schema import UtilisateurCreate, UtilisateurUpdate
from sqlalchemy import text
from app import models, schema, database

app = FastAPI()

models.Base.metadata.create_all(bind=database.engine)

@app.get("/utilisateurs/")
def get_all_users(db: Session = Depends(get_db)):
    return db.query(Utilisateur).all()

@app.post("/utilisateurs/")
def creer_utilisateur(utilisateur: UtilisateurCreate, db: Session = Depends(database.get_db)):
    
    utilisateur = models.Utilisateur(
        nom_utilisateur=utilisateur.nom_utilisateur,
        email=utilisateur.email,
        numero_tl=utilisateur.numero_tl,
        adresse=utilisateur.adresse,
        genre=utilisateur.genre,
        date_de_naissance=utilisateur.date_de_naissance,
        mot_de_passe=utilisateur.mot_de_passe 
    )
    
    db.add(utilisateur)
    db.commit()
    db.refresh(utilisateur)
    return utilisateur




@app.get("/db-test")
def test_db_connection(db: Session = Depends(get_db)):
    try:
        # Execute a simple query
        db.execute(text("SELECT 1"))
        return {"status": "success", "message": "Connected to MySQL successfully!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Connection failed: {str(e)}")
