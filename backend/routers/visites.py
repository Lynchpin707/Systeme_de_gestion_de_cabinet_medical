from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import models, schema, database, auth
from datetime import date

router = APIRouter(prefix="/visites", tags=["Visites Médicales"])

from datetime import time

@router.post("/rdv", response_model=schema.RDV)
def prendre_rdv(obj: schema.RDVCreate, db: Session = Depends(database.get_db)):
    # 1. Fix TypeError: Supprimer les fuseaux horaires pour la comparaison
    # On force l'heure reçue à être "naive" (sans Z ou offset)
    heure_a_verifier = obj.heure_rdv.replace(tzinfo=None)
    
    # 2. Vérification Heures d'ouverture
    ouverture = time(8, 0)
    fermeture = time(18, 0)
    
    if heure_a_verifier < ouverture or heure_a_verifier > fermeture:
        raise HTTPException(status_code=400, detail="Le cabinet est fermé à cette heure (8h-18h).")

    # 3. Vérification Disponibilité (conflit)
    conflit = db.query(models.RDV).filter(
        models.RDV.id_medecin == obj.id_medecin,
        models.RDV.date_rdv == obj.date_rdv,
        models.RDV.heure_rdv == heure_a_verifier
    ).first()
    
    if conflit:
        raise HTTPException(status_code=400, detail="Ce créneau est déjà pris pour ce médecin.")

    # 4. Création avec les données propres
    # On remplace l'heure avec la version sans fuseau pour la base de données
    donnees_finales = obj.model_dump() # .dict() est déprécié en Pydantic v2
    donnees_finales["heure_rdv"] = heure_a_verifier
    
    nouveau_rdv = models.RDV(**donnees_finales)
    
    db.add(nouveau_rdv)
    db.commit()
    db.refresh(nouveau_rdv)
    
    return nouveau_rdv

@router.get("/rdv/aujourdhui", response_model=list[schema.RDV])
def rdv_du_jour(db: Session = Depends(database.get_db)):
    from datetime import date
    return db.query(models.RDV).filter(models.RDV.date_rdv == date.today()).all()

@router.post("/", response_model=schema.Visite)
def creer_visite(visite: schema.VisiteCreate, db: Session = Depends(database.get_db)):
    if visite.id_RDV:
        db_rdv = db.query(models.RDV).filter(models.RDV.id_RDV == visite.id_RDV).first()
        if not db_rdv:
            raise HTTPException(status_code=404, detail="RDV non trouvé")
        # Mise à jour du statut du RDV
        db_rdv.statut = "Effectué"

    nouvelle_visite = models.Visite(**visite.dict())
    db.add(nouvelle_visite)
    db.commit()
    db.refresh(nouvelle_visite)
    return nouvelle_visite

# --- Récupérer les RDV du patient connecté ---
@router.get("/mes-rdv", response_model=list[schema.RDV])
def obtenir_mes_rdv(id_patient: int, db: Session = Depends(database.get_db)):
    # On récupère tous les RDV, classés par date (du plus récent au plus ancien)
    return db.query(models.RDV).filter(
        models.RDV.id_patient == id_patient
    ).order_by(models.RDV.date_rdv.desc()).all()

# --- Récupérer l'historique des visites du patient ---
@router.get("/mes-visites", response_model=list[schema.Visite])
def obtenir_mes_visites(id_patient: int, db: Session = Depends(database.get_db)):
    # On cherche les visites liées aux RDV de ce patient
    return db.query(models.Visite).join(models.RDV).filter(
        models.RDV.id_patient == id_patient
    ).order_by(models.Visite.id_visite.desc()).all()
    
@router.put("/rdv/{rdv_id}/modifier", response_model=schema.RDV)
def modifier_rdv(rdv_id: int, obj: schema.RDVCreate, db: Session = Depends(database.get_db)):
    # 1. Annuler l'ancien RDV
    ancien_rdv = db.query(models.RDV).filter(models.RDV.id_RDV == rdv_id).first()
    if not ancien_rdv:
        raise HTTPException(status_code=404, detail="Rendez-vous introuvable")
    
    ancien_rdv.statut = "Annulé"

    # 2. Vérifier la disponibilité pour le nouveau créneau (Logique identique à prendre_rdv)
    ouverture, fermeture = time(8, 0), time(18, 0)
    if obj.heure_rdv < ouverture or obj.heure_rdv > fermeture:
        raise HTTPException(status_code=400, detail="Le cabinet est fermé à cette heure.")

    conflit = db.query(models.RDV).filter(
        models.RDV.id_medecin == obj.id_medecin,
        models.RDV.date_rdv == obj.date_rdv,
        models.RDV.heure_rdv == obj.heure_rdv,
        models.RDV.statut != "Annulé"
    ).first()
    
    if conflit:
        raise HTTPException(status_code=400, detail="Ce nouveau créneau est déjà pris.")
    
    data = obj.dict()
    # On s'assure que le statut est "Confirmé" (ou "Prévu") peu importe ce qui vient du front
    data["statut"] = "Confirmé"

    # 3. Créer le nouveau RDV
    nouveau_rdv = models.RDV(**data)
    db.add(nouveau_rdv)
    db.commit()
    db.refresh(nouveau_rdv)
    return nouveau_rdv

@router.patch("/rdv/{rdv_id}/annuler", response_model=schema.RDV)
def annuler_rdv(rdv_id: int, db: Session = Depends(database.get_db)):
    rdv = db.query(models.RDV).filter(models.RDV.id_RDV == rdv_id).first()
    if not rdv:
        raise HTTPException(status_code=404, detail="Rendez-vous introuvable")
    
    rdv.statut = "Annulé"
    db.commit()
    db.refresh(rdv)
    return rdv

@router.post("/{id_visite}/actes")
def ajouter_actes_visite(id_visite: int, data: dict, db: Session = Depends(database.get_db)):
    id_catalogue = data.get("id_catalogue")
    actes = data.get("actes", [])
    for acte_data in actes:
        id_acte = acte_data["id_acte"]
        id_tarifier = None
        if id_catalogue:
            tarifier = db.query(models.Tarifier).filter(
                models.Tarifier.id_catalogue == id_catalogue,
                models.Tarifier.id_acte == id_acte
            ).first()
            if tarifier:
                id_tarifier = tarifier.id_tarifier
        db_acte = models.RealiserActe(id_visite=id_visite, id_acte=id_acte, id_tarifier=id_tarifier)
        db.add(db_acte)
    db.commit()
    return {"message": f"{len(actes)} acte(s) ajouté(s)"}