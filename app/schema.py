from pydantic import BaseModel
from datetime import date
from typing import Optional


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

class PatientCreate(UtilisateurCreate):
    medecin_traitant: Optional[int]
    couverture_medicale: Optional[str]
    
class EmployerCreate(UtilisateurCreate):
     
    role: str
    salaire : int
    statut: Optional[str]
    
class MedecinCreate(EmployerCreate):
    specialite: Optional[str]
 
class VisiteBase(BaseModel):
    type_visite: str
    poids: float
    temperature: float
    tension_max: float
    tension_min: float


class VisiteCreate(VisiteBase):
    id_RDV: int

class Visite(VisiteBase):
    id_visite: int
    date_visite: date

    class Config:
        from_attributes = True   
        
# --- RDV ---
class RDVBase(BaseModel):
    id_patient: int
    id_medecin: int
    date_rdv: date
    statut: str = "Prévu" # Valeur par défaut

class RDVCreate(RDVBase):
    pass

class RDV(RDVBase):
    id_RDV: int

    class Config:
        from_attributes = True # Pour Pydantic v2 (ou orm_mode=True pour v1)
        

class Utilisateur(UtilisateurCreate):
    id_utilisateur: int

    class Config:
        orm_mode = True # Pour Python 3.9 / Pydantic v1
        # ou from_attributes = True si vous utilisez Pydantic v2

class PatientOut(BaseModel):
    id_patient: int
    id_utilisateur: int
    medecin_traitant: Optional[int]
    couverture_medicale: Optional[str]

    class Config:
        orm_mode = True

class EmployerOut(BaseModel):
    id_employer: int
    id_utilisateur: int
    role: str
    salaire: int
    statut: Optional[str]

    class Config:
        orm_mode = True

class MedecinOut(BaseModel):
    id_medecin: int
    id_employer: int
    specialite: Optional[str]

    class Config:
        orm_mode = True        
        
class FactureBase(BaseModel):
    id_visite: int
    id_acte: int
    date_facture: date
    montant: float
    avance: float
    etat: str

class FactureCreate(FactureBase):
    pass

class Facture(FactureBase):
    id_facture: int
    reste: float

    class Config:
        from_attributes = True

class ActeMedical(BaseModel):
    id_acte: int
    nom_acte: str
    type_acte: str

    class Config:
        from_attributes = True
        
# --- Acte Médical ---
class ActeMedicalBase(BaseModel):
    nom_acte: str
    code_acte: str

class ActeMedicalCreate(ActeMedicalBase):
    pass

class ActeMedical(ActeMedicalBase):
    id_acte: int
    class Config:
        from_attributes = True

# --- Catalogue ---
class CatalogueBase(BaseModel):
    nom_catalogue: str
    description: Optional[str] = None

class CatalogueCreate(CatalogueBase):
    pass

class Catalogue(CatalogueBase):
    id_catalogue: int
    class Config:
        from_attributes = True

# --- Tarification ---
class TarifierCreate(BaseModel):
    id_catalogue: int
    id_acte: int
    prix: float

class Tarifier(TarifierCreate):
    id_tarifier: int
    acte: Optional[ActeMedical]
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

# --- Détails Prescription ---
class PrescriptionMedCreate(BaseModel):
    id_medicament: int
    posologie: str
    duree: str

class PrescriptionAnalyseCreate(BaseModel):
    id_analyse: int
    description: Optional[str]