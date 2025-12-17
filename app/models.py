from sqlalchemy import Column, Integer, String, Date
from sqlalchemy.ext.declarative import declarative_base
from datetime import date


Base = declarative_base()
class Utilisateur(Base):
    __tablename__ = "utilisateurs"
    id: int = Column(Integer, primary_key=True, index=True)
    nom_utilisateur: str = Column(String(50), index=True)
    email: str = Column(String(50), unique=True, index=True)
    numero_tl: str= Column(String(10), index=True)
    adresse: str = Column(String(50), unique=True, index=True)
    genre: str= Column(String(10), index=True)
    date_de_naissance: date = Column(Date)
    mot_de_passe: str = Column(String(255))