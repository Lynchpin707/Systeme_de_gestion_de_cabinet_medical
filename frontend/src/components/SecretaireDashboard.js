import React, { useState } from 'react';
import './SecretaireDashboard.css';
import AddPatientModal from './AddPatientModal';
import GestionPatients from './GestionPatients';
import MesConges from './MesConges';
import Factures from './Factures'; 
import AddFactureModal from './AddFactureModal'; 
import AddRDVModal from './AddRDVModal';

const SecretaireDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedDate, setSelectedDate] = useState('2026-01-06');
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isFactureModalOpen, setIsFactureModalOpen] = useState(false);
  
  const [isEditRDVModalOpen, setIsEditRDVModalOpen] = useState(false);
  const [patientSelectionnePourRDV, setPatientSelectionnePourRDV] = useState(null);

  const [patientSelectionne, setPatientSelectionne] = useState("");
  const [actesDuMedecin, setActesDuMedecin] = useState([]);

  const [appointments, setAppointments] = useState([
    { id: 1, date: '2026-01-06', heure: '09:00', patient: 'Sami Naciri', medecin: 'Dr. Benali', statut: 'Confirmé' },
    { id: 2, date: '2026-01-06', heure: '14:30', patient: 'Karima Fahmi', medecin: 'Dr. Chakir', statut: 'En attente' },
  ]);

  const filteredAppointments = appointments.filter(app => app.date === selectedDate);

  const handleDeleteRDV = (id) => {
    if(window.confirm("Annuler ce rendez-vous ?")) {
      setAppointments(appointments.filter(a => a.id !== id));
    }
  };

  const handleEditRDV = (appointment) => {
    setPatientSelectionnePourRDV({ nom: appointment.patient });
    setIsEditRDVModalOpen(true);
  };

  const handleGenererFacture = (nomPatient, actes) => {
    setPatientSelectionne(nomPatient);
    setActesDuMedecin(actes); 
    setIsFactureModalOpen(true);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="secretaire-dashboard-view">
            <div className="secretaire-card">
              <div className="secretaire-header-card">
                <h3>Planning Global des Rendez-vous</h3>
                <input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="secretaire-date-input"
                />
              </div>
              <table className="secretaire-table">
                <thead>
                  <tr>
                    <th>Heure</th>
                    <th>Patient</th>
                    <th>Médecin</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.length > 0 ? filteredAppointments.map(app => (
                    <tr key={app.id}>
                      <td>{app.heure}</td>
                      <td><strong>{app.patient}</strong></td>
                      <td>{app.medecin}</td>
                      <td>
                        <span className={`secretaire-status ${app.statut === 'Confirmé' ? 'blue' : 'gray'}`}>
                          {app.statut}
                        </span>
                      </td>
                      <td>
                        <button className="secretaire-icon-btn" onClick={() => handleEditRDV(app)} title="Modifier">✏️</button>
                        <button className="secretaire-icon-btn" onClick={() => handleDeleteRDV(app.id)} title="Supprimer">🗑️</button>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="5" style={{textAlign: 'center', padding: '20px'}}>Aucun rendez-vous.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="secretaire-card">
              <h3>Visites terminées (Attente Facturation)</h3>
              <table className="secretaire-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Actes</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Ahmed Alami</strong></td>
                    <td>Consultation, ECG</td>
                    <td>
                      <button className="secretaire-btn-primary" onClick={() => handleGenererFacture("Ahmed Alami", [
                        { nom: "Consultation", prix: 300 },
                        { nom: "ECG", prix: 500 }
                      ])}>Générer Facture</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'patients': return <GestionPatients onOpenAddModal={() => setIsPatientModalOpen(true)} />;
      case 'facturation': return <Factures onOpenModal={() => setIsFactureModalOpen(true)} />;
      case 'conges': return <MesConges />;
      default: return null;
    }
  };

  return (
    <div className="secretaire-layout">
      <aside className="secretaire-sidebar">
        <div className="secretaire-logo">
          <div className="secretaire-logo-square">S</div>
          <div className="secretaire-logo-text">
            <span>ESPACE</span>
            <span>SECRÉTAIRE</span>
          </div>
        </div>
        <nav className="secretaire-nav">
          <button className={`secretaire-nav-link ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>Dashboard</button>
          <button className={`secretaire-nav-link ${activeTab === 'patients' ? 'active' : ''}`} onClick={() => setActiveTab('patients')}>Gestion Patients</button>
          <button className={`secretaire-nav-link ${activeTab === 'facturation' ? 'active' : ''}`} onClick={() => setActiveTab('facturation')}>Facturation</button>
          <button className={`secretaire-nav-link ${activeTab === 'conges' ? 'active' : ''}`} onClick={() => setActiveTab('conges')}>Mes Congés</button>
        </nav>
        <button className="secretaire-logout-btn" onClick={onLogout}>🚪 Déconnexion</button>
      </aside>

      <main className="secretaire-main">
        <header className="secretaire-header">
          <div className="secretaire-header-info">
            <h1>Bonjour, Mme Alami</h1>
            <p className="secretaire-date-text">Mardi 6 Janvier 2026</p>
          </div>
          <button className="secretaire-btn-primary" onClick={() => setIsPatientModalOpen(true)}>+ Nouveau Patient</button>
        </header>
        <div className="secretaire-content-padding">{renderContent()}</div>
      </main>

      <AddPatientModal isOpen={isPatientModalOpen} onClose={() => setIsPatientModalOpen(false)} />
      <AddFactureModal isOpen={isFactureModalOpen} onClose={() => setIsFactureModalOpen(false)} initialPatient={patientSelectionne} actesPredefinis={actesDuMedecin} />
      <AddRDVModal isOpen={isEditRDVModalOpen} onClose={() => setIsEditRDVModalOpen(false)} patient={patientSelectionnePourRDV} />
    </div>
  );
};

export default SecretaireDashboard;