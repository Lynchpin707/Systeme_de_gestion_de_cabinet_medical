import datetime
from datetime import date, time, timedelta
from backend.database import SessionLocal
from backend.database import engine
from backend import models, auth

def seed():
    db = SessionLocal()
    print("🚀 Nettoyage et Initialisation massive des données...")

    try:
        # --- 1. CONFIGURATION INITIALE ---
        # Utilisateurs Staff
        u_med = models.Utilisateur(
            nom_utilisateur="Dr. Ahmed Alami", email="ahmed@clinic.ma", 
            numero_tl="0611223344", adresse="Casablanca", genre="M",
            date_de_naissance=date(1980, 5, 12), mot_de_passe=auth.hacher_password("admin123")
        )
        db.add(u_med)
        db.flush()

        emp_med = models.Employer(id_utilisateur=u_med.id_utilisateur, role="Médecin", salaire=25000, statut="Actif")
        db.add(emp_med)
        db.flush()

        medecin = models.Medecin(id_employer=emp_med.id_employer, specialite="Généraliste")
        db.add(medecin)
        db.flush()

        # Catalogue et Acte
        cat = models.Catalogue(nom_catalogue="Tarif 2025")
        db.add(cat)
        db.flush()
        acte = models.ActeMedical(nom_acte="Consultation", code_acte="CS")
        db.add(acte)
        db.flush()
        db.add(models.Tarifier(id_catalogue=cat.id_catalogue, id_acte=acte.id_acte, prix=300.0))

        # Symptôme pour l'épidémie
        symp_fievre = models.Symptome(nom_symptome="Fièvre Intense", code_symptome="FVR")
        db.add(symp_fievre)
        db.flush()

        # --- 2. CRÉATION DE 10 PATIENTS ---
        patients = []
        for i in range(1, 11):
            u_pat = models.Utilisateur(
                nom_utilisateur=f"Patient {i}", email=f"patient{i}@mail.com",
                numero_tl=f"60000000{i}", adresse="Casablanca", genre="M" if i%2==0 else "F",
                date_de_naissance=date(1990 + i, 1, 1), mot_de_passe=auth.hacher_password("patient123")
            )
            db.add(u_pat)
            db.flush()
            p = models.Patient(id_utilisateur=u_pat.id_utilisateur, medecin_traitant=medecin.id_medecin)
            db.add(p)
            db.flush()
            patients.append(p)

        # --- 3. CRÉATION DE 20 RDV ET VISITES (SUR 3 JOURS) ---
        # On simule des RDV hier, aujourd'hui et demain
        jours = [date.today() - timedelta(days=1), date.today(), date.today() + timedelta(days=1)]
        
        count = 0
        for jour in jours:
            for h in range(9, 15): # De 9h à 14h
                count += 1
                rdv = models.RDV(
                    date_rdv=jour, heure_rdv=time(h, 0), statut="Confirmé",
                    id_patient=patients[count % 10].id_patient, id_medecin=medecin.id_medecin
                )
                db.add(rdv)
                db.flush()

                # Créer des visites pour les RDV passés et d'aujourd'hui pour l'épidémie
                if jour <= date.today() and count <= 6:
                    visite = models.Visite(
                        id_RDV=rdv.id_RDV, date_visite=jour, type_visite="Urgence",
                        temperature=39.5, poids=75.0
                    )
                    db.add(visite)
                    db.flush()
                    
                    # LIAISON ÉPIDÉMIE (Table Signaler)
                    # Assurez-vous que models.Signaler existe !
                    db.execute(models.Signaler.__table__.insert().values(
                        id_visite=visite.id_visite, id_symptome=symp_fievre.id_symptome
                    ))

        db.commit()
        print(f"✅ Succès ! 10 Patients et {count} RDV créés.")
        print("⚠️ Alerte épidémie générée : 6 cas de Fièvre Intense détectés.")

    except Exception as e:
        print(f"❌ Erreur critique : {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()