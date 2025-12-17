from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Utilisateur
from app.schema import UtilisateurCreate, UtilisateurUpdate
from sqlalchemy import text


app = FastAPI()


@app.get("/utilisateurs/")
def get_all_users(db: Session = Depends(get_db)):
    return db.query(Utilisateur).all()

@app.get("/db-test")
def test_db_connection(db: Session = Depends(get_db)):
    try:
        # Execute a simple query
        db.execute(text("SELECT 1"))
        return {"status": "success", "message": "Connected to MySQL successfully!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Connection failed: {str(e)}")
