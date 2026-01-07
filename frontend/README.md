
# 🏥 Cabinet Médical - Application de Gestion

Application React complète pour la gestion d'un cabinet médical avec système de rendez-vous, facturation, gestion des employés et patients.

## 📋 Fonctionnalités

### 👨‍⚕️ Espace Admin
- Dashboard avec statistiques en temps réel
- Gestion des patients (CRUD)
- Gestion des employés (médecins, secrétaires)
- Catalogue des actes médicaux
- Gestion des congés
- Calendrier de disponibilité
- Facturation et journal des ventes (export PDF)

### 🩺 Espace Médecin
- Agenda quotidien
- Liste des patients
- Demande de congés
- Historique des consultations

### 📞 Espace Secrétaire
- Prise de rendez-vous
- Enregistrement de nouveaux patients
- Consultation des dossiers

### 👤 Espace Patient
- Prise de rendez-vous en ligne
- Historique des visites
- Consultation des factures
- Informations médecin traitant

## 🚀 Installation

### Prérequis
- Node.js (v14 ou supérieur)
- npm (v6 ou supérieur)

### Étapes d'installation

1. **Cloner le projet**
```bash
git clone <url-du-repo>
cd cabinet-medical-react-v2
```

2. **Installer les dépendances**
```bash
npm install
```

Les dépendances suivantes seront installées :
- `react@18.2.0` - Framework React
- `react-dom@18.2.0` - React DOM
- `react-scripts@5.0.1` - Scripts React
- `jspdf@2.5.1` - Génération de PDF
- `jspdf-autotable@3.8.2` - Tableaux dans PDF
- `@testing-library/react@13.4.0` - Tests React

3. **Démarrer l'application**
```bash
npm start
```

L'application sera accessible sur `http://localhost:3000`

## 🔑 Comptes de test

### Admin
- **Email**: `admin@cabinet-medical.fr`
- **Mot de passe**: `Admin@123`

### Médecin
- **Email**: `medecin@cabinet-medical.fr`
- **Mot de passe**: `Medecin@123`

### Secrétaire
- **Email**: `secretaire@cabinet-medical.fr`
- **Mot de passe**: `Secret@123`

### Patient
- **Email**: `patient@gmail.com`
- **Mot de passe**: `Patient@123`

## 📦 Structure du projet

```
cabinet-medical-react-v2/
├── public/
├── src/
│   ├── components/       # Composants réutilisables
│   │   ├── Header.js
│   │   ├── Hero.js
│   │   ├── LoginModal.js
│   │   ├── RegisterForm.js
│   │   ├── AdminDashboard.js
│   │   ├── FacturesManager.js
│   │   ├── ActesMedicauxManager.js
│   │   ├── CongeManager.js
│   │   ├── CalendrierConges.js
│   │   ├── HistoriqueVisites.js
│   │   ├── AddPatientModal.js
│   │   ├── AddEmployeeModal.js
│   │   └── ... (+ fichiers CSS)
│   ├── pages/            # Pages principales
│   │   ├── MedecinDashboard.js
│   │   ├── PatientDashboard.js
│   │   └── ... (+ fichiers CSS)
│   ├── utils/            # Utilitaires
│   │   ├── auth.js
│   │   └── database.js
│   ├── App.js            # Composant principal
│   ├── App.css
│   └── index.js
├── package.json
├── requirements.txt      # Liste des dépendances
└── README.md
```

## 🛠️ Scripts disponibles

### `npm start`
Lance l'application en mode développement.
Ouvre [http://localhost:3000](http://localhost:3000) dans le navigateur.

### `npm test`
Lance les tests en mode interactif.

### `npm run build`
Compile l'application pour la production dans le dossier `build`.

### `npm run eject`
⚠️ **Opération irréversible** - Éjecte la configuration React.

## 📄 Fonctionnalités PDF

L'application génère des PDFs professionnels pour :
- **Factures individuelles** : Design moderne avec logo, informations patient, tableau des actes, totaux
- **Journal des ventes** : Statistiques, liste des factures payées, total général

Librairies utilisées :
- `jspdf` : Création de PDF
- `jspdf-autotable` : Génération de tableaux

## 🎨 Design

- **Couleurs principales** : Turquoise (#3EAEB1), Bleu (#61BACA)
- **Typographie** : 
  - Headers : Playfair Display (serif)
  - Body : Source Sans 3 (sans-serif)
- **Design responsive** : Adapté mobile, tablette, desktop

## 🔒 Sécurité

⚠️ **Note importante** : Cette version utilise localStorage pour le stockage des données.
**Pour la production**, il est impératif de :
- Implémenter un backend sécurisé (FastAPI recommandé)
- Utiliser JWT pour l'authentification
- Hashage des mots de passe (bcrypt)
- Validation côté serveur
- Base de données PostgreSQL/MySQL

## 📝 Règles métier implémentées

1. ✅ Un patient ne peut avoir qu'un seul rendez-vous à la fois
2. ✅ Visite de contrôle gratuite si < 15 jours depuis dernière visite
3. ✅ Plusieurs paiements possibles par facture
4. ✅ Seul le médecin traitant accède au dossier complet
5. ✅ Facture = somme de tous les actes effectués


## 🤝 Contribution

Pour contribuer :
1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request



**Version** : 2.0.0  
**Date** : Janvier 2025  
**Développé avec** : ❤️ et ☕
