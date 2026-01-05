from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schema, database
from datetime import date
from typing import List

router = APIRouter(
    prefix="/factures",
    tags=["Facturation"]
)

# --- NOUVELLE ROUTE POUR LE DASHBOARD PATIENT ---
@router.get("/patient/{id_patient}", response_model=List[schema.Facture])
def obtenir_factures_patient(id_patient: int, db: Session = Depends(database.get_db)):
    """
    Récupère toutes les factures d'un patient en passant par les tables Visite et RDV.
    """
    factures = db.query(models.Facture)\
        .join(models.Visite, models.Facture.id_visite == models.Visite.id_visite)\
        .join(models.RDV, models.Visite.id_RDV == models.RDV.id_RDV)\
        .filter(models.RDV.id_patient == id_patient)\
        .order_by(models.Facture.date_facture.desc())\
        .all()
    
    return factures

# --- VOS ROUTES EXISTANTES ---
@router.post("/", response_model=schema.Facture)
def creer_facture_automatique(obj: schema.FactureCreate, db: Session = Depends(database.get_db)):
    tarif = db.query(models.Tarifier).filter(models.Tarifier.id_acte == obj.id_acte).first()

    if not tarif:
        raise HTTPException(status_code=404, detail="Prix non défini pour cet acte.")

    montant_total = tarif.prix
    reste_a_payer = montant_total - obj.avance
    etat_paiement = "Payé" if reste_a_payer <= 0 else "Partiel"
    if obj.avance == 0: etat_paiement = "En attente"

    nouvelle_facture = models.Facture(
        id_visite=obj.id_visite,
        id_acte=obj.id_acte,
        date_facture=date.today(),
        montant=montant_total,
        avance=obj.avance,
        reste=max(0, reste_a_payer), 
        etat=etat_paiement
    )

    db.add(nouvelle_facture)
    db.commit()
    db.refresh(nouvelle_facture)
    return nouvelle_facture

@router.get("/visite/{id_visite}", response_model=schema.Facture)
def obtenir_facture_visite(id_visite: int, db: Session = Depends(database.get_db)):
    facture = db.query(models.Facture).filter(models.Facture.id_visite == id_visite).first()
    if not facture:
        raise HTTPException(status_code=404, detail="Facture non trouvée")
    return facture