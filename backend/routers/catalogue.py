from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from .. import models, schema, database
from ..auth import verifier_role_admin, verifier_role

router = APIRouter(
    prefix="/catalogue",
    tags=["Catalogue et Tarifs"]
)

# --- Endpoints Catalogues ---
@router.get("/", response_model=List[schema.Catalogue])
def lister_catalogues(db: Session = Depends(database.get_db)):
    # On utilise joinedload pour charger les tarifs et les actes liés en une seule requête
    return db.query(models.Catalogue).options(
        joinedload(models.Catalogue.tarifs).joinedload(models.Tarifier.acte)
    ).all()

@router.post("/", response_model=schema.Catalogue)
def creer_catalogue(cat: schema.CatalogueCreate, db: Session = Depends(database.get_db)):
    db_cat = models.Catalogue(**cat.dict())
    db.add(db_cat)
    db.commit()
    db.refresh(db_cat)
    return db_cat

# --- Endpoints Actes ---
@router.post("/actes")
def creer_acte(obj: schema.ActeMedicalCreate, db: Session = Depends(database.get_db)):
    # Retirez temporairement le Depends(verifier_role_admin)
    nouvel_acte = models.ActeMedical(**obj.dict())
    db.add(nouvel_acte)
    db.commit()
    db.refresh(nouvel_acte)
    return nouvel_acte

@router.get("/actes", response_model=List[schema.ActeMedical])
def lister_actes(db: Session = Depends(database.get_db)):
    return db.query(models.ActeMedical).all()

# --- Endpoints Tarification (Lier acte à catalogue avec un prix) ---
@router.post("/tarifer", response_model=schema.Tarifier)
def fixer_prix(tarif: schema.TarifierCreate, db: Session = Depends(database.get_db)):
    # Vérifier si l'acte est déjà tarifé dans ce catalogue
    deja_present = db.query(models.Tarifier).filter(
        models.Tarifier.id_catalogue == tarif.id_catalogue,
        models.Tarifier.id_acte == tarif.id_acte
    ).first()
    
    if deja_present:
        deja_present.prix = tarif.prix
        db.commit()
        db.refresh(deja_present)
        return deja_present

    db_tarif = models.Tarifier(**tarif.dict())
    db.add(db_tarif)
    db.commit()
    db.refresh(db_tarif)
    return db_tarif

@router.delete("/tarifer/{id_tarifier}")
def supprimer_tarif(id_tarifier: int, db: Session = Depends(database.get_db)):
    db_tarif = db.query(models.Tarifier).filter(models.Tarifier.id_tarifier == id_tarifier).first()
    
    if not db_tarif:
        raise HTTPException(status_code=404, detail="Tarif non trouvé")
    
    db.delete(db_tarif)
    db.commit()
    return {"message": "Acte retiré du catalogue avec succès"}