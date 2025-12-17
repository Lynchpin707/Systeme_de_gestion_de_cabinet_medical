from pydantic import BaseModel
from datetime import date


class UtilisateurCreate(BaseModel):
    id: int 
    nom_utilisateur: str 
    email: str 
    numéro_tl: int 
    adresse: str 
    genre: str
    date_de_naissance: date
    password: str 

class UtilisateurUpdate(BaseModel):
    name: str
    email: str
