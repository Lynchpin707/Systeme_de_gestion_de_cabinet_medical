from pydantic import BaseModel
from datetime import date, time, datetime
from typing import Optional, List


class UtilisateurCreate(BaseModel):
    nom_utilisateur: str 
    email: str 
    numero_tl: int 
    adresse: str 
    genre: str
    date_de_naissance: date
    mot_de_passe: str 

class UtilisateurUpdate(BaseModel):
    name: str
    email: str
    
class Patient(BaseModel):
    id_patient: int
    id_utilisateur: int
    nom_utilisateur: str
    email: str
    # Indispensable pour que React puisse filtrer
    medecin_traitant: Optional[int] = None 
    couverture_medicale: Optional[str] = None

    class Config:
        from_attributes = True # Permet de lire les objets SQLAlchemy
        
class PatientCreate(UtilisateurCreate):
    medecin_traitant: Optional[int]
    couverture_medicale: Optional[str]
    
class EmployerCreate(UtilisateurCreate):
     
     
    role: str = "Medecin"
    salaire : int
    statut: Optional[str] = "Actif"
    
class MedecinCreate(EmployerCreate):
    specialite: Optional[str]
    
class Utilisateur(UtilisateurCreate):
    id_utilisateur: int

    class Config:
        from_attributes = True 

class PatientOut(BaseModel):
    id_patient: int
    id_utilisateur: int
    medecin_traitant: Optional[int]
    couverture_medicale: Optional[str]

    class Config:
        from_attributes = True 

class EmployerOut(BaseModel):
    id_employer: int
    id_utilisateur: int
    role: str
    salaire: int
    statut: Optional[str]

    class Config:
        from_attributes = True 

class MedecinOut(BaseModel):
    id_medecin: int
    id_employer: int
    specialite: Optional[str]

    class Config:
        from_attributes = True      
        
class VisiteBase(BaseModel):
    type_visite: str
    poids: Optional[float] = None
    temperature: Optional[float] = None
    tension_max: Optional[float] = None
    tension_min: Optional[float] = None


class VisiteCreate(VisiteBase):
    id_RDV: Optional[int] = None

class Visite(VisiteBase):
    id_visite: int
    date_visite: date

    class Config:
        from_attributes = True   

class RealiserActeCreate(BaseModel):
    id_acte: int
    id_tarifier: Optional[int] = None
        
# --- RDV ---
class RDVBase(BaseModel):
    id_patient: int
    id_medecin: int
    date_rdv: date
    heure_rdv: time
    statut: str = "Prévu" # Valeur par défaut

class RDVCreate(BaseModel):
    id_patient: int
    id_medecin: int
    date_rdv: date
    heure_rdv: time  # Accepte "09:00" ou "09:00:00"
    statut: str = "Prévu"

class RDV(RDVBase):
    id_RDV: int

    class Config:
        from_attributes = True 
        
class RDVOut(BaseModel):
    id_rdv: int
    date_rdv: datetime
    motif: Optional[str]
    statut: str
    id_patient: int
    patient: Optional[PatientOut] 
    class Config: from_attributes = True
        

        
# Ce que le Frontend envoie (Saisie minimale)
class FactureCreate(BaseModel):
    id_visite: int
    id_acte: int
    avance: float = 0.0

# Structure de base pour l'affichage (Lecture)
class FactureBase(BaseModel):
    id_visite: int
    id_acte: int
    date_facture: date
    montant: float
    avance: float
    reste: float 
    etat: str

# Ce que l'API renvoie 
class Facture(FactureBase):
    id_facture: int

    class Config:
        from_attributes = True

class ActeMedical(BaseModel):
    id_acte: int
    nom_acte: str
    type_acte: str

    class Config:
        from_attributes = True
        
# --- SCHÉMAS ACTE MÉDICAL ---
class ActeMedicalBase(BaseModel):
    nom_acte: str
    code_acte: str

class ActeMedicalCreate(ActeMedicalBase):
    pass

class ActeMedical(ActeMedicalBase):
    id_acte: int
    class Config:
        from_attributes = True

# --- SCHÉMAS TARIFICATION ---
class TarifierBase(BaseModel):
    id_catalogue: int
    id_acte: int
    prix: float

class TarifierCreate(TarifierBase):
    pass

class Tarifier(TarifierBase):
    id_tarifier: int
    acte: Optional[ActeMedical] = None # Permet d'inclure les détails de l'acte
    class Config:
        from_attributes = True

# --- SCHÉMAS CATALOGUE ---
class CatalogueBase(BaseModel):
    nom_catalogue: str
    description: Optional[str] = None

class CatalogueCreate(CatalogueBase):
    pass

class Catalogue(CatalogueBase):
    id_catalogue: int
    tarifs: List[Tarifier] = [] # Permet de lister les actes et prix liés
    class Config:
        from_attributes = True
# --- Dossier Médical ---
class DossierMedicalBase(BaseModel):
    id_patient: int
    groupe_sanguin: Optional[str]
    date_creation: date

class DossierMedicalCreate(DossierMedicalBase):
    pass

class DossierMedical(DossierMedicalBase):
    id_dossier: int
    class Config:
        from_attributes = True

    # --- Liaisons ---
class AjoutAllergie(BaseModel):
    id_allergie: int
    severite: Optional[str] = "Inconnue"

class AjoutMaladie(BaseModel):
    id_maladie: int
    
# --- Médicaments & Analyses ---
class MedicamentCreate(BaseModel):
    nom_medicament: str
    forme: Optional[str]

class Medicament(MedicamentCreate):
    id_medicament: int
    class Config:
        from_attributes = True

# --- Ordonnance ---
class OrdonnanceCreate(BaseModel):
    id_visite: int
    instructions: Optional[str]

class Ordonnance(OrdonnanceCreate):
    id_ordonnance: int
    class Config:
        from_attributes = True

class OrdonnanceUpdate(BaseModel):
    instructions: Optional[str] = None

# --- Détails Prescription ---
class PrescriptionMedCreate(BaseModel):
    id_medicament: int
    posologie: str
    duree: str

class PrescriptionAnalyseCreate(BaseModel):
    id_analyse: int
    description: Optional[str]
    
# --- Employer ---
class EmployerBase(BaseModel):
    id_utilisateur: int
    date_embauche: date
    salaire: float

class EmployerCreate(EmployerBase):
    pass

class Employer(EmployerBase):
    id_employer: int
    class Config:
        from_attributes = True

# --- Medecin ---
class MedecinCreate(UtilisateurCreate): # Hérite de nom, prenom, email, mdp, tel
    role: str = "Medecin"
    salaire: float
    statut: str = "Actif"
    specialite: str

class Medecin(MedecinCreate):
    id_medecin: int
    class Config:
        from_attributes = True

# --- Demande de Congé ---
class DemandeCongeCreate(BaseModel):
    id_employer: int
    date_debut_conge: date
    date_fin_conge: date
    type_conge: str

class DemandeConge(DemandeCongeCreate):
    id_demande: int
    statut: str
    class Config:
        from_attributes = True
        
# --- Symptômes ---
class SymptomeBase(BaseModel):
    nom_symptome: str
    code_symptome: Optional[str]

class SymptomeCreate(SymptomeBase):
    pass

class Symptome(SymptomeBase):
    id_symptome: int
    class Config:
        from_attributes = True

# --- Détection (Liaison) ---
class DetectionCreate(BaseModel):
    id_symptome: int
    intensite: Optional[str] = "Modérée"
    
class CongeCreate(BaseModel):
    id_employer: int
    type_conge: str
    date_debut_conge: date
    date_fin_conge: date
    
# Modifiez ces classes pour inclure explicitement les IDs
class AllergieOut(BaseModel):
    id_allergie: int  # <--- INDISPENSABLE
    nom_allergie: str
    class Config:
        from_attributes = True

class ContientAllergOut(BaseModel):
    # Ajoutez l'ID ici aussi, car c'est lui que la table de liaison utilise
    id_allergie: int  
    id_dossier: int
    severite: Optional[str]
    allergie: AllergieOut
    class Config:
        from_attributes = True

class MaladieOut(BaseModel):
    id_maladie: int  # <--- INDISPENSABLE
    nom_maladie: str
    class Config:
        from_attributes = True

class ContientMaladiesOut(BaseModel):
    id_dossier: int
    id_maladie: int  # <-- Vérifiez que cette ligne existe
    maladie: MaladieOut
    class Config:
        from_attributes = True
        
class DossierMedical(BaseModel):
    id_dossier: int
    id_patient: int
    groupe_sanguin: Optional[str]
    date_creation: date
    allergies: List[ContientAllergOut] = []
    maladies: List[ContientMaladiesOut] = []
    class Config: from_attributes = True
    
    
class Allergie(BaseModel):
    id_allergie: int
    nom_allergie: str
    class Config: from_attributes = True

class Maladie(BaseModel):
    id_maladie: int
    nom_maladie: str
    class Config: from_attributes = True
    
class AjoutAllergie(BaseModel):
    id_allergie: int
    severite: Optional[str] = "Moyenne"

class AjoutMaladie(BaseModel):
    id_maladie: int

class Analyse(BaseModel):
    id_analyse: int
    nom_analyse: str
    class Config:
        from_attributes = True