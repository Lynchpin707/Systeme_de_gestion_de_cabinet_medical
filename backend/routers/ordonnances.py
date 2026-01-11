from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schema, database
from ..auth import verifier_role

router = APIRouter(prefix="/ordonnances", tags=["Prescriptions"])

@router.post("/", response_model=schema.Ordonnance)
def creer_ordonnance(obj: schema.OrdonnanceCreate, db: Session = Depends(database.get_db)):
    nouvelle_ordonnance = models.Ordonnance(**obj.dict())
    db.add(nouvelle_ordonnance)
    db.commit()
    db.refresh(nouvelle_ordonnance)
    return nouvelle_ordonnance

@router.put("/{id_ordonnance}", response_model=schema.Ordonnance)
def modifier_ordonnance(id_ordonnance: int, obj: schema.OrdonnanceUpdate, db: Session = Depends(database.get_db)):
    ordonnance = db.query(models.Ordonnance).filter(models.Ordonnance.id_ordonnance == id_ordonnance).first()
    if not ordonnance:
        raise HTTPException(status_code=404, detail="Ordonnance non trouvée")
    for key, value in obj.dict().items():
        setattr(ordonnance, key, value)
    db.commit()
    db.refresh(ordonnance)
    return ordonnance

@router.post("/{id_ordonnance}/medicaments")
def ajouter_medicament(id_ordonnance: int, item: schema.PrescriptionMedCreate, db: Session = Depends(database.get_db)):
    db_item = models.PrescrireMed(id_ordonnance=id_ordonnance, **item.dict())
    db.add(db_item)
    db.commit()
    return {"message": "Médicament ajouté"}

@router.post("/{id_ordonnance}/analyses")
def ajouter_analyse(id_ordonnance: int, item: schema.PrescriptionAnalyseCreate, db: Session = Depends(database.get_db)):
    db_item = models.PrescrireAnalyse(id_ordonnance=id_ordonnance, **item.dict())
    db.add(db_item)
    db.commit()
    return {"message": "Analyse ajoutée"}

@router.get("/{id_ordonnance}/medicaments")
def obtenir_medicaments_ordonnance(id_ordonnance: int, db: Session = Depends(database.get_db)):
    results = db.query(models.PrescrireMed, models.Medicament.nom_medicament).join(models.Medicament).filter(models.PrescrireMed.id_ordonnance == id_ordonnance).all()
    return [{"id_medicament": r[0].id_medicament, "nom_medicament": r[1], "posologie": r[0].posologie, "duree": r[0].duree} for r in results]

@router.get("/{id_ordonnance}/analyses")
def obtenir_analyses_ordonnance(id_ordonnance: int, db: Session = Depends(database.get_db)):
    results = db.query(models.PrescrireAnalyse, models.Analyse.nom_analyse).join(models.Analyse).filter(models.PrescrireAnalyse.id_ordonnance == id_ordonnance).all()
    return [{"id_analyse": r[0].id_analyse, "nom_analyse": r[1], "description": r[0].description} for r in results]

@router.get("/medicaments", response_model=list[schema.Medicament])
def lister_medicaments(db: Session = Depends(database.get_db)):
    return db.query(models.Medicament).all()

@router.get("/analyses", response_model=list[schema.Analyse])
def lister_analyses(db: Session = Depends(database.get_db)):
    return db.query(models.Analyse).all()

@router.get("/visite/{id_visite}")
def obtenir_ordonnance_visite(id_visite: int, db: Session = Depends(database.get_db)):
    return db.query(models.Ordonnance).filter(models.Ordonnance.id_visite == id_visite).first()

# --- Gestion du Référentiel Médicaments ---

@router.post("/referentiel-medicaments", response_model=schema.Medicament)
def creer_medicament_dans_dictionnaire(med: schema.MedicamentCreate, db: Session = Depends(database.get_db), _ = Depends(verifier_role(["Admin", "Médecin"]))):
    nouveau_med = models.Medicament(**med.dict())
    db.add(nouveau_med)
    db.commit()
    db.refresh(nouveau_med)
    return nouveau_med

@router.get("/referentiel-medicaments", response_model=list[schema.Medicament])
def lister_tous_les_medicaments(db: Session = Depends(database.get_db)):
    return db.query(models.Medicament).all()