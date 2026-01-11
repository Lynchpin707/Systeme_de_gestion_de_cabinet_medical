from sqlalchemy import text
from backend.database import SessionLocal

def clear_referential_data():
    db = SessionLocal()
    try:
        # Désactiver les contraintes pour éviter les blocages lors de la suppression
        db.execute(text("SET FOREIGN_KEY_CHECKS = 0;"))

        # Liste des tables référentielles et de liaison à vider
        tables_to_empty = [
            "tarifier",
            "catalogue",
            "acte_medical",
            "medicament",
            "analyse",
            "allergie",
            "maladie",
            "symptome",
            "contient_allerg",
            "contient_maladies",
            "prescrire_med",
            "prescrire_analyse",
            "detecter",
            "signaler"
        ]

        for table in tables_to_empty:
            db.execute(text(f"TRUNCATE TABLE {table};"))
            print(f"清 Emptying table: {table}")

        # Réactiver les contraintes
        db.execute(text("SET FOREIGN_KEY_CHECKS = 1;"))
        
        db.commit()
        print("\n✅ Les tables référentielles ont été vidées proprement.")

    except Exception as e:
        db.rollback()
        print(f"❌ Erreur lors du nettoyage : {e}")
    finally:
        db.close()

if __name__ == "__main__":
    clear_referential_data()