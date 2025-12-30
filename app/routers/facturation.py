from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schema, database

router = APIRouter(
    prefix="/factures",
    tags=["Facturation"]
)

@router.post("/", response_model=schema.Facture)
def creer_facture(donnees: schema.FactureCreate, db: Session = Depends(database.get_db)):
    # Calcul automatique du reste
    montant_reste = donnees.montant - donnees.avance
    
    nouvelle_facture = models.Facture(
        **donnees.dict(),
        reste=montant_reste
    )
    
    db.add(nouvelle_facture)
    db.commit()
    db.refresh(nouvelle_facture)
    return nouvelle_facture

@router.get("/{id_visite}", response_model=schema.Facture)
def obtenir_facture_visite(id_visite: int, db: Session = Depends(database.get_db)):
    facture = db.query(models.Facture).filter(models.Facture.id_visite == id_visite).first()
    if not facture:
        raise HTTPException(status_code=404, detail="Facture non trouvée pour cette visite")
    return facture