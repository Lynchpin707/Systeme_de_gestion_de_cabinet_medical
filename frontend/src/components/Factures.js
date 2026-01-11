import React, { useState } from 'react';
import FactureDetailsModal from './FactureDetailsModal';

const Factures = ({ onOpenModal }) => {
  const [selectedFacture, setSelectedFacture] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // États pour la gestion du complément de paiement
  const [factureAPayer, setFactureAPayer] = useState(null);
  const [versement, setVersement] = useState(0);

  // Utilisation d'un State pour la liste afin de pouvoir la modifier
  const [listeFactures, setListeFactures] = useState([
    { 
      id: "FAC-001", 
      date: "06/01/2026", 
      patient: "Ahmed Alami", 
      montant: 800, 
      reste: 300, 
      etat: "Partielle",
      couverture: "CNOPS",
      actes: [
        { nom: "Consultation générale", prix: 300 },
        { nom: "Électrocardiogramme (ECG)", prix: 500 }
      ],
      paiements: [
        { date: "06/01/2026", montant: 500 }
      ]
    }
  ]);

  const handleShowDetails = (facture) => {
    setSelectedFacture(facture);
    setIsDetailsOpen(true);
  };

  const handleSavePaiement = () => {
    const montantVersé = parseFloat(versement);
    if (isNaN(montantVersé) || montantVersé <= 0) return alert("Veuillez saisir un montant valide");

    const nouvellesFactures = listeFactures.map((f) => {
      if (f.id === factureAPayer.id) {
        const nouveauReste = f.reste - montantVersé;
        return {
          ...f,
          reste: nouveauReste,
          etat: nouveauReste <= 0 ? "Payée" : "Partielle",
          paiements: [...f.paiements, { date: "06/01/2026", montant: montantVersé }]
        };
      }
      return f;
    });

    setListeFactures(nouvellesFactures);
    setFactureAPayer(null); 
    setVersement(0);
  };

  return (
    <div className="secretaire-card"> {/* Changé: admin-table-card -> secretaire-card */}
      <div className="secretaire-header-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3>Gestion des Factures</h3>
        <button className="secretaire-btn-primary" onClick={onOpenModal}>+ Nouvelle Facture</button>
      </div>

      <table className="secretaire-table"> {/* Changé: admin-table -> secretaire-table */}
        <thead>
          <tr>
            <th>ID FACTURE</th>
            <th>DATE</th>
            <th>PATIENT</th>
            <th>MONTANT</th>
            <th>ÉTAT</th>
            <th>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {listeFactures.map((facture) => (
            <tr key={facture.id}>
              <td>{facture.id}</td>
              <td>{facture.date}</td>
              <td><strong>{facture.patient}</strong></td>
              <td>{facture.montant} MAD</td>
              <td>
                <span className={`secretaire-status ${facture.etat === 'Payée' ? 'blue' : 'gray'}`}> {/* Utilisation des couleurs blue/gray du dashboard */}
                  {facture.etat}
                </span>
              </td>
              <td>
                <button className="secretaire-icon-btn" onClick={() => handleShowDetails(facture)} title="Voir détails">
                  👁️
                </button>

                {facture.reste > 0 && (
                  <button className="secretaire-icon-btn" onClick={() => setFactureAPayer(facture)} title="Régler" style={{ color: '#10B981' }}>
                    💰
                  </button>
                )}

                <button className="secretaire-icon-btn" title="Télécharger PDF">
                  📄
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modale de Détails */}
      <FactureDetailsModal 
        isOpen={isDetailsOpen} 
        onClose={() => setIsDetailsOpen(false)} 
        facture={selectedFacture} 
      />

      {/* MODALE INTERNE : Compléter le paiement */}
      {factureAPayer && (
        <div className="modal-overlay">
          <div className="secretaire-card" style={{ width: '400px', margin: 'auto', position: 'relative', top: '20%' }}>
            <h2 style={{ color: '#1D837F', marginBottom: '15px' }}>Règlement Patient</h2>
            
            <p className="secretaire-date-text">Patient : <strong>{factureAPayer.patient}</strong></p>

            <div style={{ background: '#FFF5F5', color: '#E53E3E', padding: '10px', borderRadius: '8px', margin: '15px 0', fontWeight: 'bold' }}>
              Reste actuel : {factureAPayer.reste} MAD
            </div>

            <div className="form-group">
              <label className="secretaire-date-text">Montant du versement (MAD)</label>
              <input 
                type="number" 
                className="secretaire-input" 
                placeholder="0.00"
                onChange={(e) => setVersement(e.target.value)}
                autoFocus
              />
            </div>

            <div style={{ background: '#F0F9FA', padding: '10px', borderRadius: '8px', marginTop: '10px' }}>
              Nouveau reste : <strong>{factureAPayer.reste - versement} MAD</strong>
            </div>

            <div className="secretaire-modal-footer">
              <button className="secretaire-btn-secondary" onClick={() => setFactureAPayer(null)}>Annuler</button>
              <button className="secretaire-btn-primary" onClick={handleSavePaiement}>Confirmer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Factures;