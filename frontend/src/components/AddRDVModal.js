import React, { useState } from 'react';

const AddRDVModal = ({ isOpen, onClose, patient }) => {
  const [rdvData, setRdvData] = useState({
    date: '', heure: '', medecin: '', type: 'Normal'
  });

  if (!isOpen || !patient) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`RDV enregistré pour ${patient.nom} le ${rdvData.date} à ${rdvData.heure}`);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="secretaire-card" style={{ width: '450px', margin: 'auto', position: 'relative', top: '15%' }}>
        <div className="secretaire-header-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: '15px', marginBottom: '20px' }}>
          <h2 style={{ color: '#1D837F', margin: 0, fontSize: '20px' }}>Prendre un RDV</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#64748B' }}>&times;</button>
        </div>

        <div style={{ background: '#F0F9FA', padding: '12px', borderRadius: '10px', border: '1px solid rgba(62, 174, 177, 0.2)', marginBottom: '20px' }}>
            <span className="secretaire-date-text" style={{ fontSize: '12px' }}>Patient sélectionné :</span>
            <div style={{ fontWeight: '600', color: '#1D837F' }}>{patient.nom}</div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label className="secretaire-date-text">Date</label>
              <input 
                type="date" 
                className="secretaire-input" 
                required 
                onChange={(e) => setRdvData({...rdvData, date: e.target.value})} 
              />
            </div>
            <div className="form-group">
              <label className="secretaire-date-text">Heure</label>
              <input 
                type="time" 
                className="secretaire-input" 
                required 
                onChange={(e) => setRdvData({...rdvData, heure: e.target.value})} 
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '15px' }}>
            <label className="secretaire-date-text">Médecin</label>
            <select 
              className="secretaire-input" 
              required 
              onChange={(e) => setRdvData({...rdvData, medecin: e.target.value})}
            >
              <option value="">Choisir un médecin...</option>
              <option value="Dr. Benali">Dr. Benali</option>
              <option value="Dr. Chakir">Dr. Chakir</option>
            </select>
          </div>

          <div className="secretaire-modal-footer" style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="secretaire-btn-secondary" onClick={onClose}>Annuler</button>
            <button type="submit" className="secretaire-btn-primary">Confirmer le RDV</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRDVModal;