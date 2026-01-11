import React from 'react';

const FactureDetailsModal = ({ isOpen, onClose, facture }) => {
  // Si la modale n'est pas ouverte ou s'il n'y a pas de facture, on ne renvoie rien
  if (!isOpen || !facture) return null;

  return (
    <div className="modal-overlay" onClick={onClose}> {/* Cliquer à l'extérieur ferme la modale */}
      <div 
        className="secretaire-card" 
        style={{ 
          width: '500px', 
          margin: 'auto', 
          position: 'relative', 
          top: '5%', 
          maxHeight: '90vh', 
          overflowY: 'auto' 
        }}
        onClick={(e) => e.stopPropagation()} // Empêche la fermeture quand on clique à l'intérieur
      >
        
        {/* BOUTON FERMER (CROIX) */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#94A3B8'
          }}
        >
          &times;
        </button>

        <div className="secretaire-header-card" style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '15px', marginBottom: '20px' }}>
          <h2 style={{ color: '#1D837F', margin: 0 }}>Détails de la Facture</h2>
        </div>

        <div className="modal-body">
          {/* Header Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <div>
              <label className="secretaire-date-text" style={{ fontSize: '12px' }}>Patient</label>
              <p style={{ fontWeight: '600', margin: '5px 0' }}>{facture.patient}</p>
            </div>
            <div>
              <label className="secretaire-date-text" style={{ fontSize: '12px' }}>Date</label>
              <p style={{ margin: '5px 0' }}>{facture.date}</p>
            </div>
            <div>
              <label className="secretaire-date-text" style={{ fontSize: '12px' }}>Couverture</label>
              <p style={{ margin: '5px 0' }}>
                <span className="secretaire-status blue">{facture.couverture || "CNOPS"}</span>
              </p>
            </div>
          </div>

          {/* Liste des actes */}
          <div style={{ background: '#F8FAFC', padding: '15px', borderRadius: '12px', marginBottom: '20px' }}>
            <label className="secretaire-date-text" style={{ display: 'block', marginBottom: '10px' }}>Actes Médicaux</label>
            {facture.actes && facture.actes.map((acte, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px dashed #E2E8F0' }}>
                <span style={{ fontSize: '14px' }}>{acte.nom}</span>
                <span style={{ fontWeight: 700, color: '#1F2937' }}>{acte.prix} MAD</span>
              </div>
            ))}
          </div>

          {/* Historique des Avances */}
          <div style={{ marginBottom: '20px' }}>
            <label className="secretaire-date-text" style={{ display: 'block', marginBottom: '10px' }}>Historique des Avances</label>
            {facture.paiements && facture.paiements.map((p, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'white', border: '1px solid #F1F5F9', borderRadius: '8px', marginBottom: '8px' }}>
                <div>
                  <strong style={{ fontSize: '13px' }}>Avance #{i+1}</strong>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>{p.date}</div>
                </div>
                <span style={{ color: '#10B981', fontWeight: 700 }}>-{p.montant} MAD</span>
              </div>
            ))}
          </div>

          {/* Résumé Final */}
          <div style={{ background: '#F0F9FA', padding: '15px', borderRadius: '12px', border: '1px solid rgba(62, 174, 177, 0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '14px' }}>
              <span>Total des actes :</span>
              <span>{facture.montant} MAD</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px', color: '#10B981' }}>
              <span>Total déjà réglé :</span>
              <span>- {facture.montant - (facture.reste || 0)} MAD</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', borderTop: '2px solid white', fontWeight: 'bold', color: '#E53E3E' }}>
              <span>Reste à payer :</span>
              <span style={{ fontSize: '18px' }}>{facture.reste} MAD</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '20px', textAlign: 'right' }}>
          <button 
            className="secretaire-btn-primary" 
            onClick={onClose}
            style={{ width: '100%', padding: '12px' }}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default FactureDetailsModal;