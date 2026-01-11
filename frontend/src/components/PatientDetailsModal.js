import React from 'react';

const PatientDetailsModal = ({ isOpen, onClose, patient }) => {
  if (!isOpen || !patient) return null;

  return (
    <div className="modal-overlay">
      {/* Utilisation de secretaire-card pour l'unité visuelle */}
      <div className="secretaire-card" style={{ maxWidth: '600px', margin: 'auto', position: 'relative', top: '10%' }}>
        
        <div className="secretaire-header-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: '15px', marginBottom: '20px' }}>
          <h2 style={{ color: '#1D837F', margin: 0, fontSize: '22px' }}>Fiche Patient : {patient.nom}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#64748B' }}>&times;</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          {/* Section Identité */}
          <div>
            <h4 style={{ color: '#3EAEB1', borderBottom: '2px solid #F0F9FA', marginBottom: '15px', paddingBottom: '5px', fontSize: '14px', textTransform: 'uppercase' }}>Identité</h4>
            <div style={{ marginBottom: '12px' }}>
              <span className="secretaire-date-text" style={{ fontSize: '11px', display: 'block' }}>NOM COMPLET</span>
              <span style={{ fontWeight: '600', color: '#1F2937' }}>{patient.nom}</span>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <span className="secretaire-date-text" style={{ fontSize: '11px', display: 'block' }}>GENRE</span>
              <span style={{ color: '#1F2937' }}>{patient.genre}</span>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <span className="secretaire-date-text" style={{ fontSize: '11px', display: 'block' }}>DATE DE NAISSANCE</span>
              <span style={{ color: '#1F2937' }}>{patient.naissance}</span>
            </div>
          </div>

          {/* Section Contact & Assurance */}
          <div>
            <h4 style={{ color: '#3EAEB1', borderBottom: '2px solid #F0F9FA', marginBottom: '15px', paddingBottom: '5px', fontSize: '14px', textTransform: 'uppercase' }}>Contact & Assurance</h4>
            <div style={{ marginBottom: '12px' }}>
              <span className="secretaire-date-text" style={{ fontSize: '11px', display: 'block' }}>TÉLÉPHONE</span>
              <span style={{ fontWeight: '600', color: '#1F2937' }}>{patient.tel}</span>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <span className="secretaire-date-text" style={{ fontSize: '11px', display: 'block' }}>COUVERTURE</span>
              <span className="secretaire-status blue" style={{ marginTop: '5px', display: 'inline-block' }}>{patient.couverture}</span>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <span className="secretaire-date-text" style={{ fontSize: '11px', display: 'block' }}>ADRESSE</span>
              <span style={{ fontSize: '13px', color: '#1F2937' }}>{patient.adresse}</span>
            </div>
          </div>
        </div>

        {/* Bloc Email - Mis en valeur avec le style bleu clair du dashboard */}
        <div style={{ marginTop: '20px', background: '#F0F9FA', padding: '15px', borderRadius: '12px', border: '1px solid rgba(62, 174, 177, 0.1)' }}>
            <span className="secretaire-date-text" style={{ fontSize: '11px' }}>ADRESSE EMAIL</span>
            <p style={{ margin: '5px 0 0 0', fontWeight: '500', color: '#1D837F' }}>{patient.email}</p>
        </div>

        <div className="secretaire-modal-footer" style={{ marginTop: '25px' }}>
          <button className="secretaire-btn-primary" onClick={onClose} style={{ width: '100%' }}>
            Fermer la fiche
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientDetailsModal;