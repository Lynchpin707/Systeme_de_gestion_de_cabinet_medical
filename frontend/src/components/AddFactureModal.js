import React, { useState, useEffect } from 'react';

const AddFactureModal = ({ isOpen, onClose, initialPatient, actesPredefinis }) => {
  const [nomPatient, setNomPatient] = useState("");
  const [actesSelectionnes, setActesSelectionnes] = useState([]);
  const [avance, setAvance] = useState(0);

  // Simulation du catalogue Admin - Logique conservée
  const catalogueActes = [
    { nom: "Consultation générale", prix: 300 },
    { nom: "Électrocardiogramme (ECG)", prix: 500 },
    { nom: "Échographie", prix: 600 }
  ];

  useEffect(() => {
    if (isOpen) {
      setNomPatient(initialPatient || "");
      setActesSelectionnes(actesPredefinis && actesPredefinis.length > 0 ? actesPredefinis : []);
      setAvance(0);
    }
  }, [isOpen, initialPatient, actesPredefinis]);

  const ajouterActeManuel = (e) => {
    const acteObj = catalogueActes.find(a => a.nom === e.target.value);
    if (acteObj) setActesSelectionnes([...actesSelectionnes, acteObj]);
  };

  const total = actesSelectionnes.reduce((sum, acte) => sum + acte.prix, 0);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="secretaire-card" style={{ width: '500px', margin: 'auto', position: 'relative', top: '10%' }}>
        
        <div className="secretaire-header-card" style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '15px', marginBottom: '20px' }}>
          <h2 style={{ color: '#1D837F', margin: 0 }}>Générer la Facture</h2>
        </div>

        <div className="form-group" style={{ marginBottom: '15px' }}>
          <label className="secretaire-date-text">Nom du Patient</label>
          <input 
            type="text" 
            className="secretaire-input" 
            placeholder="Nom du patient..."
            value={nomPatient} 
            onChange={(e) => setNomPatient(e.target.value)}
          />
        </div>

        {/* SI VIDE : ON AFFICHE LE CATALOGUE */}
        {(!actesPredefinis || actesPredefinis.length === 0) && (
          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label className="secretaire-date-text">Ajouter un acte (Catalogue)</label>
            <select className="secretaire-input" onChange={ajouterActeManuel} defaultValue="">
              <option value="" disabled>Choisir un acte...</option>
              {catalogueActes.map((a, i) => <option key={i} value={a.nom}>{a.nom} ({a.prix} MAD)</option>)}
            </select>
          </div>
        )}

        <div style={{ background: '#F8FAFC', padding: '15px', borderRadius: '12px', marginBottom: '15px' }}>
          <label className="secretaire-date-text" style={{ display: 'block', marginBottom: '10px' }}>Détails des actes</label>
          {actesSelectionnes.map((acte, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px dashed #E2E8F0' }}>
              <span style={{ fontSize: '14px' }}>{acte.nom}</span>
              <strong style={{ fontSize: '14px', color: '#1F2937' }}>{acte.prix} MAD</strong>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '15px' }}>
          <div className="form-group">
            <label className="secretaire-date-text">Total Global</label>
            <div className="secretaire-input" style={{ background: '#F1F5F9', fontWeight: 'bold' }}>{total} MAD</div>
          </div>
          <div className="form-group">
            <label className="secretaire-date-text">Avance (MAD)</label>
            <input 
              type="number" 
              className="secretaire-input" 
              value={avance} 
              onChange={(e) => setAvance(e.target.value)} 
            />
          </div>
        </div>

        <div style={{ background: '#F0F9FA', padding: '15px', borderRadius: '12px', border: '1px solid rgba(62, 174, 177, 0.3)', color: '#1D837F', textAlign: 'center', fontWeight: 'bold', fontSize: '18px' }}>
          Reste à payer : {total - avance} MAD
        </div>

        <div className="secretaire-modal-footer" style={{ marginTop: '25px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button className="secretaire-btn-secondary" onClick={onClose}>Annuler</button>
          <button className="secretaire-btn-primary" onClick={() => alert("Facture générée et prête pour l'impression !")}>
            Valider & Imprimer
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddFactureModal;