import React, { useState } from 'react';
import './MedecinDashboard.css';

const MedecinDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('planning');

  // Données de démonstration
  const mesPatients = [
    { id: 1, nom: 'Alami Ahmed', prochainRDV: '2024-12-30 10:00', statut: 'Actif' },
    { id: 2, nom: 'Benali Sara', prochainRDV: '2024-12-31 14:00', statut: 'Actif' },
    { id: 3, nom: 'Chakir Mohamed', prochainRDV: '2025-01-02 09:00', statut: 'Actif' }
  ];

  const rdvAujourdhui = [
    { heure: '09:00', patient: 'Alami Ahmed', type: 'Consultation', statut: 'confirme' },
    { heure: '10:30', patient: 'Benali Sara', type: 'Contrôle', statut: 'confirme' },
    { heure: '14:00', patient: 'Chakir Mohamed', type: 'Consultation', statut: 'en_attente' }
  ];

  return (
    <div className="medecin-dashboard">
      {/* Sidebar */}
      <aside className="medecin-sidebar">
        <div className="medecin-logo">
          <div className="logo-icon">
            <svg viewBox="0 0 24 24" fill="white">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
              <path d="M9 12l2 2 4-4"/>
            </svg>
          </div>
          <span>Espace Médecin</span>
        </div>

        <nav className="medecin-nav">
          <button 
            className={`nav-btn ${activeTab === 'planning' ? 'active' : ''}`}
            onClick={() => setActiveTab('planning')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            Mon Planning
          </button>

          <button 
            className={`nav-btn ${activeTab === 'patients' ? 'active' : ''}`}
            onClick={() => setActiveTab('patients')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
            </svg>
            Mes Patients
          </button>

          <button 
            className={`nav-btn ${activeTab === 'conges' ? 'active' : ''}`}
            onClick={() => setActiveTab('conges')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            Mes Congés
          </button>
        </nav>

        <button className="logout-btn" onClick={onLogout}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Déconnexion
        </button>
      </aside>

      {/* Main Content */}
      <main className="medecin-main">
        <header className="medecin-header">
          <div>
            <h1>Bienvenue, Dr. {user?.nom_utilisateur || user?.nom}</h1>
            <p>Aujourd'hui : {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="header-stats">
            <div className="stat-mini">
              <span className="stat-number">{rdvAujourdhui.length}</span>
              <span className="stat-label">RDV aujourd'hui</span>
            </div>
            <div className="stat-mini">
              <span className="stat-number">{mesPatients.length}</span>
              <span className="stat-label">Patients suivis</span>
            </div>
          </div>
        </header>

        <div className="medecin-content">
          {activeTab === 'planning' && (
            <div className="planning-section">
              <h2>Planning du jour</h2>
              <div className="rdv-timeline">
                {rdvAujourdhui.map((rdv, index) => (
                  <div key={index} className="rdv-item">
                    <div className="rdv-time">{rdv.heure}</div>
                    <div className="rdv-details">
                      <h4>{rdv.patient}</h4>
                      <p>{rdv.type}</p>
                      <span className={`rdv-status ${rdv.statut}`}>
                        {rdv.statut === 'confirme' ? 'Confirmé' : 'En attente'}
                      </span>
                    </div>
                    <button className="rdv-action">Voir dossier</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'patients' && (
            <div className="patients-section">
              <h2>Mes Patients</h2>
              <div className="patients-grid">
                {mesPatients.map(patient => (
                  <div key={patient.id} className="patient-card-medecin">
                    <div className="patient-avatar-medecin">
                      {patient.nom.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="patient-info-medecin">
                      <h3>{patient.nom}</h3>
                      <p>Prochain RDV: {patient.prochainRDV}</p>
                      <span className="patient-status">{patient.statut}</span>
                    </div>
                    <button className="btn-dossier">Voir dossier</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'conges' && (
            <div className="conges-section">
              <h2>Demandes de Congé</h2>
              <button className="btn-demander">+ Demander un congé</button>
              <p style={{ marginTop: '20px', color: '#6B7280' }}>Aucune demande de congé en cours</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MedecinDashboard;