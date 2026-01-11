from sqlalchemy.orm import Session
from backend.database import SessionLocal, engine
from backend import models  # Assurez-vous que vos modèles sont importés correctement

def seed_db():
    db = SessionLocal()
    try:
        # 1. CATALOGUE DES MÉDICAMENTS
        medicaments = [
            models.Medicament(nom_medicament="Paracétamol", forme="Comprimé"),
            models.Medicament(nom_medicament="Amoxicilline", forme="Gélule"),
            models.Medicament(nom_medicament="Ibuprofène", forme="Comprimé"),
            models.Medicament(nom_medicament="Ventoline", forme="Inhalateur"),
            models.Medicament(nom_medicament="Spasfon", forme="Lyoc")
        ]

        # 2. CATALOGUE DES ANALYSES
        analyses = [
            models.Analyse(nom_analyse="NFS (Hémogramme)"),
            models.Analyse(nom_analyse="Glycémie à jeun"),
            models.Analyse(nom_analyse="Bilan Lipidique"),
            models.Analyse(nom_analyse="Radiographie Thorax"),
            models.Analyse(nom_analyse="Échographie Abdominale")
        ]

        # 3. RÉFÉRENTIEL DES ALLERGIES
        allergies = [
            models.Allergie(nom_allergie="Pénicilline"),
            models.Allergie(nom_allergie="Pollen"),
            models.Allergie(nom_allergie="Arachides"),
            models.Allergie(nom_allergie="Lactose"),
            models.Allergie(nom_allergie="Aspirine")
        ]

        # 4. RÉFÉRENTIEL DES MALADIES
        maladies = [
            models.Maladie(nom_maladie="Diabète Type 2"),
            models.Maladie(nom_maladie="Hypertension Artérielle"),
            models.Maladie(nom_maladie="Asthme"),
            models.Maladie(nom_maladie="Hypothyroïdie"),
            models.Maladie(nom_maladie="Anémie")
        ]

        # 5. RÉFÉRENTIEL DES SYMPTÔMES
        symptomes = [
            models.Symptome(nom_symptome="Fièvre", code_symptome="FVR"),
            models.Symptome(nom_symptome="Toux Sèche", code_symptome="TOUX"),
            models.Symptome(nom_symptome="Céphalées", code_symptome="CEPH"),
            models.Symptome(nom_symptome="Douleurs Abdominales", code_symptome="DABDO"),
            models.Symptome(nom_symptome="Fatigue Chronique", code_symptome="ASTH")
        ]

        # 6. ACTES MÉDICAUX ET CATALOGUE (TARIFS)
        catalogue_standard = models.Catalogue(nom_catalogue="Tarification Standard", description="Tarifs de base")
        db.add(catalogue_standard)
        db.flush() # Pour obtenir l'id_catalogue

        actes = [
            models.ActeMedical(nom_acte="Consultation Générale", code_acte="C"),
            models.ActeMedical(nom_acte="Consultation Spécialiste", code_acte="CS"),
            models.ActeMedical(nom_acte="ECG", code_acte="ECG")
        ]
        db.add_all(actes)
        db.flush()

        # Association Prix <-> Acte <-> Catalogue
        tarifs = [
            models.Tarifier(id_catalogue=catalogue_standard.id_catalogue, id_acte=actes[0].id_acte, prix=300.0),
            models.Tarifier(id_catalogue=catalogue_standard.id_catalogue, id_acte=actes[1].id_acte, prix=500.0),
            models.Tarifier(id_catalogue=catalogue_standard.id_catalogue, id_acte=actes[2].id_acte, prix=400.0)
        ]

        # Ajout final
        db.add_all(medicaments + analyses + allergies + maladies + symptomes + tarifs)
        db.commit()
        print("✅ Référentiels SI initialisés avec succès.")

    except Exception as e:
        print(f"❌ Erreur : {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()