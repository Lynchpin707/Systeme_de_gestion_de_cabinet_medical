from pydantic import BaseModel
from datetime import date


class UtilisateurCreate(BaseModel):
    id: int 
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
