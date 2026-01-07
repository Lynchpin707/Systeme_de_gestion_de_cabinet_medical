// Simulation de la base de données avec toutes les entités

export const initialData = {
  // Utilisateurs avec rôles multiples
  users: [
    {
      id_utilisateur: 1,
      nom_utilisateur: 'Admin',
      prenom_utilisateur: 'Système',
      email: 'admin@cabinet-medical.fr',
      numero_tlp: '0612345678',
      adresse: 'Casablanca',
      genre: 'Homme',
      dateNaissance: '1980-01-01',
      roles: ['admin'] // Un utilisateur peut avoir plusieurs rôles
    },
    {
      id_utilisateur: 2,
      nom_utilisateur: 'Benali',
      prenom_utilisateur: 'Karim',
      email: 'k.benali@cabinet.fr',
      numero_tlp: '0623456789',
      adresse: 'Casablanca',
      genre: 'Homme',
      dateNaissance: '1985-05-15',
      roles: ['employe', 'medecin']
    }
  ],

  // Employés (médecins ou réceptionnistes)
  employees: [
    {
      id_employer: 1,
      id_utilisateur: 2,
      role: 'medecin',
      salaire: 15000,
      statut: 'actif'
    }
  ],

  // Médecins (hérite d'employé)
  medecins: [
    {
      id_medecin: 1,
      id_employer: 1,
      specialite: 'Cardiologue'
    }
  ],

  // Patients
  patients: [
    {
      id_patient: 1,
      id_utilisateur: 3,
      medecin_traitant: 1, // id_medecin du médecin traitant
      couverture_medicale: 'CNSS'
    }
  ],

  // Dossiers médicaux (1 par patient)
  dossiersMedicaux: [
    {
      id_dossier: 1,
      id_patient: 1,
      antecedents: 'Diabète type 2',
      allergies: 'Pénicilline',
      groupe_sanguin: 'A+'
    }
  ],

  // Catalogue des actes médicaux
  actesMedicaux: [
    {
      id_acte: 1,
      nom_acte: 'Consultation générale',
      tarif: 300
    },
    {
      id_acte: 2,
      nom_acte: 'Électrocardiogramme (ECG)',
      tarif: 500
    },
    {
      id_acte: 3,
      nom_acte: 'Échographie',
      tarif: 800
    }
  ],

  // Disponibilités des médecins
  disponibilites: [
    {
      id_disponibilite: 1,
      id_medecin: 1,
      jour: 'Lundi',
      heure_debut: '09:00',
      heure_fin: '17:00'
    }
  ],

  // Rendez-vous
  rendezVous: [
    {
      id_rdv: 1,
      id_patient: 1,
      id_medecin: 1,
      date_rdv: '2024-12-30',
      heure_rdv: '10:00',
      type_visite: 'visite_simple', // 'visite_simple' ou 'control'
      statut: 'confirme', // 'confirme', 'annule', 'modifie', 'termine'
      id_visite_precedente: null // Pour les contrôles
    }
  ],

  // Visites (créées après le RDV)
  visites: [
    {
      id_visite: 1,
      id_rdv: 1,
      date_visite: '2024-12-30',
      observations: 'Patient en bonne santé',
      actes_effectues: [1] // Liste des id_acte
    }
  ],

  // Prescriptions
  prescriptions: [
    {
      id_prescription: 1,
      id_visite: 1,
      type: 'medicament', // 'medicament', 'analyse', 'radio'
      description: 'Paracétamol 500mg',
      posologie: '3 fois par jour pendant 5 jours'
    }
  ],

  // Factures
  factures: [
    {
      id_facture: 1,
      id_visite: 1,
      montant_total: 300,
      montant_paye: 300,
      statut: 'payee' // 'payee', 'partielle', 'impayee'
    }
  ],

  // Paiements
  paiements: [
    {
      id_paiement: 1,
      id_facture: 1,
      date_paiement: '2024-12-30',
      montant: 300,
      mode_paiement: 'especes' // 'especes', 'carte', 'cheque'
    }
  ],

  // Demandes de congé
  demandesConge: [
    {
      id_conge: 1,
      id_employer: 1,
      date_debut: '2025-01-15',
      date_fin: '2025-01-20',
      motif: 'Congé annuel',
      statut: 'en_attente' // 'en_attente', 'accepte', 'refuse'
    }
  ]
};

// Fonction pour obtenir un utilisateur complet avec ses rôles
export const getFullUserData = (userId) => {
  const user = initialData.users.find(u => u.id_utilisateur === userId);
  if (!user) return null;

  const fullData = { ...user };

  // Si employé, récupérer les données employé
  if (user.roles.includes('employe')) {
    const employee = initialData.employees.find(e => e.id_utilisateur === userId);
    fullData.employeeData = employee;

    // Si médecin, récupérer les données médecin
    if (user.roles.includes('medecin')) {
      const medecin = initialData.medecins.find(m => m.id_employer === employee?.id_employer);
      fullData.medecinData = medecin;
    }
  }

  // Si patient, récupérer les données patient
  if (user.roles.includes('patient')) {
    const patient = initialData.patients.find(p => p.id_utilisateur === userId);
    fullData.patientData = patient;
  }

  return fullData;
};

// Règles de validation
export const businessRules = {
  // Vérifier si un patient peut prendre un RDV (pas de RDV en cours)
  canPatientBookAppointment: (patientId) => {
    const activeRDV = initialData.rendezVous.find(
      rdv => rdv.id_patient === patientId && 
             rdv.statut !== 'annule' && 
             rdv.statut !== 'termine'
    );
    return !activeRDV;
  },

  // Vérifier si un contrôle est dans les 15 jours
  canRequestControl: (visiteId) => {
    const visite = initialData.visites.find(v => v.id_visite === visiteId);
    if (!visite) return false;

    const visitDate = new Date(visite.date_visite);
    const today = new Date();
    const daysDiff = Math.floor((today - visitDate) / (1000 * 60 * 60 * 24));

    return daysDiff <= 15;
  },

  // Vérifier disponibilité médecin
  isMedecinAvailable: (medecinId, date, heure) => {
    // Vérifier la disponibilité générale
    const jour = new Date(date).toLocaleDateString('fr-FR', { weekday: 'long' });
    const dispo = initialData.disponibilites.find(
      d => d.id_medecin === medecinId && d.jour === jour
    );

    if (!dispo) return false;

    // Vérifier qu'il n'y a pas déjà un RDV à cette heure
    const rdvExistant = initialData.rendezVous.find(
      rdv => rdv.id_medecin === medecinId && 
             rdv.date_rdv === date && 
             rdv.heure_rdv === heure &&
             rdv.statut !== 'annule'
    );

    return !rdvExistant;
  },

  // Vérifier si l'utilisateur peut accéder au dossier médical
  canAccessDossierMedical: (userId, patientId) => {
    const patient = initialData.patients.find(p => p.id_patient === patientId);
    if (!patient) return false;

    const user = initialData.users.find(u => u.id_utilisateur === userId);
    if (!user) return false;

    // Admin peut accéder
    if (user.roles.includes('admin')) return true;

    // Médecin traitant peut accéder
    if (user.roles.includes('medecin')) {
      const employee = initialData.employees.find(e => e.id_utilisateur === userId);
      const medecin = initialData.medecins.find(m => m.id_employer === employee?.id_employer);
      return medecin?.id_medecin === patient.medecin_traitant;
    }

    return false;
  }
};