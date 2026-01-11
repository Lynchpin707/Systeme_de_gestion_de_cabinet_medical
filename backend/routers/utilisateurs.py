from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

# Importations relatives
from .. import models, schema, database, auth
from ..database import get_db

router = APIRouter(
    prefix="/utilisateurs",
    tags=["Gestion des Utilisateurs"]
)

# 1. Lister tous les utilisateurs
@router.get("/", response_model=List[schema.Utilisateur])
def get_all_users(db: Session = Depends(get_db)):
    # Utilisation de models.Utilisateur car importé via 'from .. import models'
    return db.query(models.Utilisateur).all()

# 2. Créer un utilisateur simple
@router.post("/")
def creer_utilisateur(utilisateur: schema.UtilisateurCreate, db: Session = Depends(get_db)):
    # .dict() est la méthode standard pour Python 3.9 / Pydantic v1
    nouvel_utilisateur = models.Utilisateur(**utilisateur.dict())
    
    db.add(nouvel_utilisateur)
    db.commit()
    db.refresh(nouvel_utilisateur)
    return nouvel_utilisateur

# 3. Créer un Patient
@router.post("/patient")
def creer_patient(donnees: schema.PatientCreate, db: Session = Depends(get_db)):
    # On sépare les données utilisateur des données patient
    infos_user = donnees.dict(exclude={'medecin_traitant', 'couverture_medicale'})
    nouvel_utilisateur = models.Utilisateur(**infos_user)
    
    db.add(nouvel_utilisateur)
    db.flush() 
    
    nouveau_patient = models.Patient(
        id_utilisateur=nouvel_utilisateur.id_utilisateur,
        medecin_traitant=donnees.medecin_traitant,
        couverture_medicale=donnees.couverture_medicale
    )
    
    db.add(nouveau_patient)
    db.commit()
    db.refresh(nouveau_patient)
    return nouveau_patient

# 4. Créer un Employé
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import models, database, auth, schema

router = APIRouter(prefix="/utilisateurs", tags=["Utilisateurs"])

# AJOUT D'UN EMPLOYÉ (ADMIN OU MÉDECIN)
@router.post("/employes")
def ajouter_employe(donnees: schema.UtilisateurCreate, role: str = "medecin", db: Session = Depends(database.get_db)):
    # 1. Créer l'utilisateur de base
    nouvel_user = models.Utilisateur(
        nom_utilisateur=donnees.nom_utilisateur,
        email=donnees.email,
        mot_de_passe=auth.hacher_password(donnees.mot_de_passe),
        numero_tl=donnees.numero_tl
    )
    db.add(nouvel_user)
    db.flush()

    # 2. Créer l'entrée Employer
    nouvel_employe = models.Employer(id_utilisateur=nouvel_user.id_utilisateur, role=role)
    db.add(nouvel_employe)
    
    db.commit()
    return {"message": "Employé ajouté"}

# 5. Créer un Médecin (3 niveaux)
from ..auth import pwd_context # Importez le contexte de hachage défini dans auth.py

@router.post("/employer/medecin")
def creer_medecin(donnees: schema.MedecinCreate, db: Session = Depends(get_db)):
    champs_medecin = {'specialite'}
    champs_employer = {'role', 'salaire', 'statut'}
    
    # --- Hachage du mot de passe ---
    user_dict = donnees.dict(exclude=champs_medecin | champs_employer)
    # On remplace le mot de passe en clair par sa version hachée
    user_dict["mot_de_passe"] = pwd_context.hash(donnees.mot_de_passe)
    
    # Niveau 1 : Utilisateur
    nouvel_utilisateur = models.Utilisateur(**user_dict)
    db.add(nouvel_utilisateur)
    db.flush()
    
    # Niveau 2 : Employer
    emp_data = donnees.dict(include=champs_employer)
    nouvel_employer = models.Employer(
        id_utilisateur=nouvel_utilisateur.id_utilisateur, 
        **emp_data
    )
    db.add(nouvel_employer)
    db.flush()
    
    # Niveau 3 : Medecin
    medecin = models.Medecin(
        id_employer=nouvel_employer.id_employer, 
        specialite=donnees.specialite
    )
    db.add(medecin)
    
    db.commit()
    db.refresh(medecin)
    return medecin


@router.post("/admin")
def ajoute_admin(donnees: schema.UtilisateurCreate, db: Session = Depends(get_db)):
    # 1. Vérifier si l'email existe déjà pour éviter un crash SQL
    deja_existant = db.query(models.Utilisateur).filter(models.Utilisateur.email == donnees.email).first()
    if deja_existant:
        raise HTTPException(status_code=400, detail="Cet email est déjà utilisé")

    # 2. Créer l'Utilisateur de base (uniquement avec les champs de votre UtilisateurCreate)
    nouvel_utilisateur = models.Utilisateur(
        nom_utilisateur=donnees.nom_utilisateur,
        email=donnees.email,
        numero_tl=donnees.numero_tl,
        adresse=donnees.adresse,
        genre=donnees.genre,
        date_de_naissance=donnees.date_de_naissance,
        # Assurez-vous que 'auth' est importé pour le hachage
        mot_de_passe=auth.hacher_password(donnees.mot_de_passe) 
    )
    
    db.add(nouvel_utilisateur)
    db.flush() 

    # 3. Créer l'entrée Admin liée
    nouvel_admin = models.Admin(
        id_utilisateur=nouvel_utilisateur.id_utilisateur
    )
    
    db.add(nouvel_admin)
    db.commit()
    db.refresh(nouvel_admin)

    return {"message": "Admin créé", "id": nouvel_admin.id_admin}


@router.get("/employes")
def lister_employes(db: Session = Depends(database.get_db)):
    # On récupère les lignes
    resultats = db.query(
        models.Utilisateur,
        models.Employer,
        models.Medecin
    ).join(models.Employer, models.Utilisateur.id_utilisateur == models.Employer.id_utilisateur)\
     .outerjoin(models.Medecin, models.Employer.id_employer == models.Medecin.id_employer).all()
    
    # On transforme manuellement en liste de dictionnaires pour éviter l'erreur de sérialisation
    liste_finale = []
    for user, emp, med in resultats:
        liste_finale.append({
            "id_utilisateur": user.id_utilisateur,
            "nom_utilisateur": user.nom_utilisateur,
            "email": user.email,
            "numero_tl": user.numero_tl,
            "role": emp.role,
            "salaire": emp.salaire,
            "specialite": med.specialite if med else "Secrétariat"
        })
    
    return liste_finale


@router.delete("/employes/{email}")
def supprimer_employe(email: str, db: Session = Depends(database.get_db)):
    user = db.query(models.Utilisateur).filter(models.Utilisateur.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Employé non trouvé")
    
    db.delete(user)
    db.commit()
    return {"message": "Employé supprimé avec succès"}