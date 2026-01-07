from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schema, database

router = APIRouter(prefix="/rh", tags=["Gestion du Personnel"])

@router.post("/employer", response_model=schema.Employer)
def recruter_employer(obj: schema.EmployerCreate, db: Session = Depends(database.get_db)):
    nouveau = models.Employer(**obj.dict())
    db.add(nouveau)
    db.commit()
    db.refresh(nouveau)
    return nouveau

@router.post("/employer/{id_employer}/conge")
def demander_conge_employer(id_employer: int, donnees: schema.CongeCreate, db: Session = Depends(database.get_db)):
    # Vérifier si l'employé existe
    employer = db.query(models.Employer).filter(models.Employer.id_employer == id_employer).first()
    if not employer:
        raise HTTPException(status_code=404, detail="Employé non trouvé")

    # Création de la demande
    nouvelle_demande = models.DemandeConge(
        id_employer=id_employer,
        type_conge=donnees.type_conge,
        date_debut_conge=donnees.date_debut_conge,
        date_fin_conge=donnees.date_fin_conge,
        statut="en_attente"
    )
    
    db.add(nouvelle_demande)
    db.commit()
    db.refresh(nouvelle_demande)
    
    return {"message": "Demande de congé enregistrée", "id_demande": nouvelle_demande.id_demande}

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

