from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schema, database
from datetime import date

router = APIRouter(
    prefix="/factures",
    tags=["Facturation"]
)

@router.post("/", response_model=schema.Facture)
def creer_facture_automatique(obj: schema.FactureCreate, db: Session = Depends(database.get_db)):
    # 1. Aller chercher le prix de l'acte dans la table Tarifier
    # On prend le tarif du catalogue par défaut (ex: ID 1)
    tarif = db.query(models.Tarifier).filter(
        models.Tarifier.id_acte == obj.id_acte
    ).first()

    if not tarif:
        raise HTTPException(status_code=404, detail="Prix non défini pour cet acte dans le catalogue.")

    # 2. Calculer automatiquement le reste
    montant_total = tarif.prix
    reste_a_payer = montant_total - obj.avance

    # 3. Déterminer l'état automatiquement
    etat_paiement = "Payé" if reste_a_payer <= 0 else "Partiel"
    if obj.avance == 0: etat_paiement = "En attente"

    # 4. Créer l'entrée en base
    nouvelle_facture = models.Facture(
        id_visite=obj.id_visite,
        id_acte=obj.id_acte,
        date_facture=date.today(),
        montant=montant_total,
        avance=obj.avance,
        reste=max(0, reste_a_payer), # Évite un reste négatif
        etat=etat_paiement
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