from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schema, database

router = APIRouter(prefix="/clinique", tags=["Examen Clinique"])

# --- ROUTES POUR LE DASHBOARD MÉDECIN ---

@router.get("/rendez-vous/medecin/{id_utilisateur}", response_model=List[schema.RDV])
def get_rdv_medecin(id_utilisateur: int, db: Session = Depends(database.get_db)):
    """Récupère les RDV via l'ID utilisateur du médecin"""
    # On rejoint Medecin et Employer pour filtrer par id_utilisateur
    return db.query(models.RDV).join(models.Medecin).join(models.Employer).filter(
        models.Employer.id_utilisateur == id_utilisateur
    ).all()

@router.get("/patients/mes-patients/{id_utilisateur}", response_model=List[schema.Patient])
def get_mes_patients(id_utilisateur: int, db: Session = Depends(database.get_db)):
    """
    Chemin : Utilisateur(id) -> Employer(id_u) -> Medecin(id_e) -> Patient(id_m)
    """
    # 1. On récupère l'ID médecin en passant par Employer
    medecin_data = db.query(models.Medecin).join(
        models.Employer, models.Medecin.id_employer == models.Employer.id_employer
    ).filter(
        models.Employer.id_utilisateur == id_utilisateur
    ).first()

    if not medecin_data:
        raise HTTPException(status_code=404, detail="Aucun profil médecin trouvé pour cet utilisateur")

    # 2. On récupère les patients liés à cet id_medecin spécifique
    # On fait une jointure avec Utilisateur pour remplir les champs 'nom_utilisateur' et 'email'
    patients = db.query(
        models.Patient.id_patient,
        models.Patient.id_utilisateur,
        models.Patient.medecin_traitant,
        models.Patient.couverture_medicale,
        models.Utilisateur.nom_utilisateur,
        models.Utilisateur.email
    ).join(
        models.Utilisateur, models.Patient.id_utilisateur == models.Utilisateur.id_utilisateur
    ).filter(
        models.Patient.medecin_traitant == medecin_data.id_medecin
    ).all()

    return patients

@router.get("/conges/employer/{id_utilisateur}", response_model=List[schema.DemandeConge])
def get_conges_medecin(id_utilisateur: int, db: Session = Depends(database.get_db)):
    """Récupère les congés du médecin via son ID Utilisateur"""
    return db.query(models.DemandeConge).join(models.Employer).filter(
        models.Employer.id_utilisateur == id_utilisateur
    ).all()


# --- ROUTES EXAMEN CLINIQUE (SYMPTÔMES) ---

@router.post("/symptomes", response_model=schema.Symptome)
def creer_symptome(obj: schema.SymptomeCreate, db: Session = Depends(database.get_db)):
    nouveau = models.Symptome(**obj.model_dump())
    db.add(nouveau)
    db.commit()
    db.refresh(nouveau)
    return nouveau

@router.post("/visite/{id_visite}/detecter")
def noter_symptomes(id_visite: int, symptomes: List[schema.DetectionCreate], db: Session = Depends(database.get_db)):
    # Vérification de l'existence de la visite
    visite = db.query(models.Visite).filter(models.Visite.id_visite == id_visite).first()
    if not visite:
        raise HTTPException(status_code=404, detail="Visite non trouvée")

    for item in symptomes:
        liaison = models.Detecter(id_visite=id_visite, **item.model_dump())
        db.add(liaison)
    
    db.commit()
    return {"status": "success", "message": f"{len(symptomes)} symptôme(s) enregistré(s)"}

@router.get("/visite/{id_visite}/symptomes")
def get_symptomes_visite(id_visite: int, db: Session = Depends(database.get_db)):
    return db.query(models.Detecter).filter(models.Detecter.id_visite == id_visite).all()

# --- ALLERGIES ---
@router.post("/{id_dossier}/allergies")
def ajouter_allergie(id_dossier: int, allergie: schema.AjoutAllergie, db: Session = Depends(database.get_db)):
    liaison = models.ContientAllerg(id_dossier=id_dossier, **allergie.dict())
    db.add(liaison)
    db.commit()
    return {"message": "Allergie ajoutée"}

@router.delete("/{id_dossier}/allergies/{id_allergie}")
def supprimer_allergie(id_dossier: int, id_allergie: int, db: Session = Depends(database.get_db)):
    db.query(models.ContientAllerg).filter(
        models.ContientAllerg.id_dossier == id_dossier,
        models.ContientAllerg.id_allergie == id_allergie
    ).delete()
    db.commit()
    return {"message": "Allergie supprimée"}

# --- MALADIES ---
@router.post("/{id_dossier}/maladies")
def ajouter_maladie(id_dossier: int, id_maladie: int, db: Session = Depends(database.get_db)):
    liaison = models.ContientMaladies(id_dossier=id_dossier, id_maladie=id_maladie)
    db.add(liaison)
    db.commit()
    return {"message": "Maladie ajoutée"}

@router.delete("/{id_dossier}/maladies/{id_maladie}")
def supprimer_maladie(id_dossier: int, id_maladie: int, db: Session = Depends(database.get_db)):
    db.query(models.ContientMaladies).filter(
        models.ContientMaladies.id_dossier == id_dossier,
        models.ContientMaladies.id_maladie == id_maladie
    ).delete()
    db.commit()
    return {"message": "Maladie supprimée"}

@router.get("/allergies", response_model=List[schema.Allergie])
def list_all_allergies(db: Session = Depends(database.get_db)):
    return db.query(models.Allergie).all()

# Route pour lister TOUTES les maladies disponibles en base
@router.get("/maladies", response_model=List[schema.Maladie])
def list_all_maladies(db: Session = Depends(database.get_db)):
    return db.query(models.Maladie).all()