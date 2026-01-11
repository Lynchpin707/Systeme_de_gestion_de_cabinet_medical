import React, { useState } from 'react';
import AddRDVModal from './AddRDVModal';
import PatientDetailsModal from './PatientDetailsModal';

const GestionPatients = ({ onOpenAddModal }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isRDVModalOpen, setIsRDVModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Simulation de données - Logique conservée
  const patients = [
    { id: 1, nom: "Ahmed Alami", tel: "0661223344", derniereVisite: "12/12/2025", medecin: "Dr. Benali", email: "ahmed@email.com", adresse: "Casablanca, Maârif", genre: "Masculin", naissance: "15/05/1985", couverture: "CNOPS" }
  ];

  // Filtrage des patients - Logique conservée
  const filteredPatients = patients.filter(p => 
    p.nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.tel.includes(searchTerm)
  );

  return (
    <div className="secretaire-card"> {/* Changé: admin-table-card -> secretaire-card */}
      <div className="secretaire-header-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '15px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <h2 style={{ color: '#1D837F', margin: 0 }}>Base de données Patients</h2>
          <button className="secretaire-btn-primary" onClick={onOpenAddModal}>+ Nouveau Patient</button>
        </div>
        
        {/* BARRE DE RECHERCHE - Style harmonisé */}
        <div style={{ width: '100%' }}>
          <input 
            type="text" 
            placeholder="Rechercher un patient (Nom ou téléphone)..." 
            className="secretaire-input"
            style={{ marginBottom: '0' }}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <table className="secretaire-table"> {/* Changé: admin-table -> secretaire-table */}
        <thead>
          <tr>
            <th>PATIENT</th>
            <th>TÉLÉPHONE</th>
            <th>DERNIÈRE VISITE</th>
            <th>MÉDECIN</th>
            <th style={{ textAlign: 'center' }}>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {filteredPatients.length > 0 ? (
            filteredPatients.map(p => (
              <tr key={p.id}>
                <td><strong>{p.nom}</strong></td>
                <td>{p.tel}</td>
                <td>{p.derniereVisite}</td>
                <td>{p.medecin}</td>
                <td style={{ textAlign: 'center' }}>
                  <button 
                    className="secretaire-icon-btn" 
                    title="Fiche Patient" 
                    onClick={() => { setSelectedPatient(p); setIsDetailsModalOpen(true); }}
                  >
                    📄
                  </button>
                  <button 
                    className="secretaire-icon-btn" 
                    title="Prendre RDV" 
                    onClick={() => { setSelectedPatient(p); setIsRDVModalOpen(true); }} 
                    style={{ color: '#3EAEB1' }}
                  >
                    📅
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>
                Aucun patient trouvé.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Modales conservées avec leur logique */}
      <AddRDVModal isOpen={isRDVModalOpen} onClose={() => setIsRDVModalOpen(false)} patient={selectedPatient} />
      <PatientDetailsModal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} patient={selectedPatient} />
    </div>
  );
};

export default GestionPatients;