from app.database import engine
from app import models

# 1. Supprime toutes les tables existantes
models.Base.metadata.drop_all(bind=engine)
print("Base de données vidée.")

# 2. Recrée les tables à partir des nouveaux modèles
models.Base.metadata.create_all(bind=engine)
print("Base de données recréée proprement.")