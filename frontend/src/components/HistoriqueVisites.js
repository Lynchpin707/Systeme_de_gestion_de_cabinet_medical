import React, { useState } from 'react';
import './HistoriqueVisites.css';

const HistoriqueVisites = ({ patientId, patientNom }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Données de démonstration
  const visites = [
    {
      id_visite: 1,
      date: '2024-12-15',
      medecin: 'Dr. Benali',
      type: 'Consultation',
      diagnostic: 'Grippe saisonnière',
      actes: ['Consultation générale', 'ECG'],
      prescriptions: [
        { type: 'Médicament', nom: 'Paracétamol 500mg', posologie: '3x/jour pendant 5 jours' },
        { type: 'Analyse', nom: 'Prise de sang complète', posologie: 'À jeun' }
      ],
      montant: 800
    },
    {
      id_visite: 2,
      date: '2024-11-20',
      medecin: 'Dr. Chakir',
      type: 'Contrôle',
      diagnostic: 'Suivi post-opératoire - Bon rétablissement',
      actes: ['Consultation générale'],
      prescriptions: [],
      montant: 0 // Contrôle gratuit
    },
    {
      id_visite: 3,
      date: '2024-10-05',
      medecin: 'Dr. Benali',
      type: 'Consultation',
      diagnostic: 'Hypertension artérielle',
      actes: ['Consultation générale', 'ECG'],
      prescriptions: [
        { type: 'Médicament', nom: 'Amlodipine 5mg', posologie: '1x/jour le matin' }
      ],
      montant: 800
    }
  ];

  if (!isOpen) {
    return (
      <button className="btn-voir-historique" onClick={() => setIsOpen(true)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        Voir l'historique
      </button>
    );
  }

  return (
    <div className="historique-modal-overlay" onClick={() => setIsOpen(false)}>
      <div className="historique-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="historique-header">
          <div>
            <h2>Historique des Visites</h2>
            <p>Patient : <strong>{patientNom}</strong></p>
          </div>
          <button className="modal-close-btn" onClick={() => setIsOpen(false)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Timeline des visites */}
        <div className="historique-content">
          {visites.length === 0 ? (
            <div className="empty-historique">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p>Aucune visite enregistrée</p>
            </div>
          ) : (
            <div className="visites-timeline">
              {visites.map((visite, index) => (
                <div key={visite.id_visite} className="visite-card">
                  <div className="visite-date-badge">
                    <div className="date-icon">
                      {index === 0 ? '📅' : '📋'}
                    </div>
                    <div className="date-info">
                      <span className="date-text">
                        {new Date(visite.date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                      <span className="visite-type">{visite.type}</span>
                    </div>
                  </div>

                  <div className="visite-details">
                    <div className="visite-header-info">
                      <h3>{visite.medecin}</h3>
                      {visite.montant > 0 ? (
                        <span className="visite-montant">{visite.montant} MAD</span>
                      ) : (
                        <span className="visite-gratuit">Gratuit</span>
                      )}
                    </div>

                    <div className="visite-diagnostic">
                      <strong>Diagnostic :</strong>
                      <p>{visite.diagnostic}</p>
                    </div>

                    {visite.actes.length > 0 && (
                      <div className="visite-section">
                        <strong>Actes effectués :</strong>
                        <div className="actes-list">
                          {visite.actes.map((acte, i) => (
                            <span key={i} className="acte-badge">{acte}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {visite.prescriptions.length > 0 && (
                      <div className="visite-section">
                        <strong>Prescriptions :</strong>
                        <div className="prescriptions-list">
                          {visite.prescriptions.map((presc, i) => (
                            <div key={i} className="prescription-item">
                              <div className="prescription-type">
                                {presc.type === 'Médicament' && '💊'}
                                {presc.type === 'Analyse' && '🔬'}
                                {presc.type === 'Radio' && '🩻'}
                              </div>
                              <div className="prescription-details">
                                <span className="prescription-nom">{presc.nom}</span>
                                <span className="prescription-posologie">{presc.posologie}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="historique-footer">
          <button className="btn-export" onClick={() => alert('Export PDF à venir')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Exporter en PDF
          </button>
          <button className="btn-fermer" onClick={() => setIsOpen(false)}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default HistoriqueVisites;