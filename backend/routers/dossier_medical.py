from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schema, database
from ..auth import get_utilisateur_actuel
from pydantic import BaseModel

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

from sqlalchemy.orm import joinedload

@router.get("/{id_patient}", response_model=schema.DossierMedical)
def obtenir_dossier(id_patient: int, db: Session = Depends(database.get_db)):
    dossier = db.query(models.DossierMedical).options(
        joinedload(models.DossierMedical.allergies).joinedload(models.ContientAllerg.allergie),
        joinedload(models.DossierMedical.maladies).joinedload(models.ContientMaladies.maladie)
    ).filter(models.DossierMedical.id_patient == id_patient).first()
    
    if not dossier:
        raise HTTPException(status_code=404, detail="Dossier non trouvé")
    return dossier
@router.post("/{id_dossier}/allergies")
def ajouter_allergie(id_dossier: int, allergie: schema.AjoutAllergie, db: Session = Depends(database.get_db)):
    nueva_liaison = models.ContientAllerg(
        id_dossier=id_dossier, 
        id_allergie=allergie.id_allergie, 
        severite=allergie.severite
    )
    db.add(nueva_liaison)
    db.commit()
    return {"message": "Allergie ajoutée"}

@router.post("/{id_dossier}/maladies")
def ajouter_maladie(id_dossier: int, maladie: schema.AjoutMaladie, db: Session = Depends(database.get_db)):
    nueva_liaison = models.ContientMaladies(
        id_dossier=id_dossier, 
        id_maladie=maladie.id_maladie
    )
    db.add(nueva_liaison)
    db.commit()
    return {"message": "Maladie ajoutée"}


@router.delete("/{id_dossier}/allergies/{id_allergie}")
def supprimer_allergie(id_dossier: int, id_allergie: int, db: Session = Depends(database.get_db)):
    db.query(models.ContientAllerg).filter(
        models.ContientAllerg.id_dossier == id_dossier,
        models.ContientAllerg.id_allergie == id_allergie
    ).delete()
    db.commit()
    return {"status": "deleted"}

@router.delete("/{id_dossier}/maladies/{id_maladie}")
def supprimer_maladie(id_dossier: int, id_maladie: int, db: Session = Depends(database.get_db)):
    db.query(models.ContientMaladies).filter(
        models.ContientMaladies.id_dossier == id_dossier,
        models.ContientMaladies.id_maladie == id_maladie
    ).delete()
    db.commit()
    return {"message": "Maladie supprimée"}