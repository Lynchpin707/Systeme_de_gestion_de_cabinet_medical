from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from .. import models, schema, database

router = APIRouter(prefix="/rh", tags=["Gestion du Personnel"])

@router.post("/employer", response_model=schema.Employer)
def recruter_employer(obj: schema.EmployerCreate, db: Session = Depends(database.get_db)):
    nouveau = models.Employer(**obj.dict())
    db.add(nouveau)
    db.commit()
    db.refresh(nouveau)
    return nouveau

@router.post("/employer/{id_utilisateur}/conge")
def demander_conge_employer(id_utilisateur: int, donnees: schema.DemandeCongeCreate, db: Session = Depends(database.get_db)):
    # 1. Trouver l'employé lié à cet utilisateur
    employer = db.query(models.Employer).filter(models.Employer.id_utilisateur == id_utilisateur).first()
    
    if not employer:
        raise HTTPException(status_code=404, detail="Profil employé introuvable pour cet utilisateur")

    # 2. Création de la demande avec le BON id_employer
    nouvelle_demande = models.DemandeConge(
        id_employer=employer.id_employer, # On utilise l'ID trouvé en base
        type_conge=donnees.type_conge,
        date_debut_conge=donnees.date_debut_conge,
        date_fin_conge=donnees.date_fin_conge,
        statut="en_attente"
    )
    
    db.add(nouvelle_demande)
    db.commit()
    return {"message": "Demande de congé enregistrée"}

@router.get("/conges/employer/{id_utilisateur}")
def liste_conges_medecin(id_utilisateur: int, db: Session = Depends(database.get_db)):
    employer = db.query(models.Employer).filter(models.Employer.id_utilisateur == id_utilisateur).first()
    if not employer: return []
    return db.query(models.DemandeConge).filter(models.DemandeConge.id_employer == employer.id_employer).all()

@router.get("/conges")
def lister_conges(db: Session = Depends(database.get_db)):
    # Utilisation de join pour récupérer le nom de l'utilisateur lié à la demande
    resultats = db.query(
        models.DemandeConge, 
        models.Utilisateur.nom_utilisateur
    ).join(
        models.Employer, models.DemandeConge.id_employer == models.Employer.id_employer
    ).join(
        models.Utilisateur, models.Employer.id_utilisateur == models.Utilisateur.id_utilisateur
    ).all()

    # IMPORTANT : Vérifiez que les clés (date_debut, etc.) correspondent à ce que React attend
    return [
        {
            "id_demande": d.id_demande,
            "nom_utilisateur": nom,
            "type_conge": d.type_conge,
            "date_debut": d.date_debut_conge, # React attend 'date_debut'
            "date_fin": d.date_fin_conge,     # React attend 'date_fin'
            "statut": d.statut
        } for d, nom in resultats
    ]

@router.patch("/conges/{id_demande}/statut")
def approuver_conge(id_demande: int, db: Session = Depends(database.get_db)):
    # 1. Trouver la demande
    demande = db.query(models.DemandeConge).filter(models.DemandeConge.id_demande == id_demande).first()
    if not demande:
        raise HTTPException(status_code=404, detail="Demande introuvable")
    
    # 2. Mettre à jour la demande
    demande.statut = "accepte"
    
    # 3. Trouver l'employé lié et changer son statut
    employe = db.query(models.Employer).filter(models.Employer.id_employer == demande.id_employer).first()
    if employe:
        employe.statut = "en congé"
    
    db.commit()
    return {"message": "Congé accepté et statut employé mis à jour"}

@router.patch("/conges/{id_demande}/refuser")
def refuser_conge(id_demande: int, db: Session = Depends(database.get_db)):
    # 1. Trouver la demande
    demande = db.query(models.DemandeConge).filter(models.DemandeConge.id_demande == id_demande).first()
    
    if not demande:
        raise HTTPException(status_code=404, detail="Demande introuvable")
    
    # 2. Mettre à jour uniquement le statut de la demande
    demande.statut = "refusé"
    
    # Note : On ne touche pas au statut de l'employé (il reste "actif")
    
    db.commit()
    return {"message": "La demande de congé a été refusée"}


@router.get("/rendez-vous/medecin/{id_utilisateur}")
def obtenir_rdv_medecin(id_utilisateur: int, db: Session = Depends(database.get_db)):
    # 1. On trouve l'employé à partir de l'utilisateur
    employer = db.query(models.Employer).filter(models.Employer.id_utilisateur == id_utilisateur).first()
    if not employer:
        return []

    # 2. On trouve le médecin à partir de l'employé
    medecin = db.query(models.Medecin).filter(models.Medecin.id_employer == employer.id_employer).first()
    if not medecin:
        return []

    # 3. On récupère les RDV
    return db.query(models.RDV).filter(models.RDV.id_medecin == medecin.id_medecin).all()
