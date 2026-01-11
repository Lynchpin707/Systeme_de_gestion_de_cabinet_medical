import React, { useState } from 'react';
import './MesConges.css';

const MesConges = ({ conges, onAddConge }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type_conge: 'annuel',
    date_debut_conge: '',
    date_fin_conge: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // On envoie une copie propre des données
    onAddConge({ ...formData });
    
    // Réinitialisation du formulaire
    setFormData({ type_conge: 'annuel', date_debut_conge: '', date_fin_conge: '' });
    setShowForm(false);
  };

  // Helper pour formater les badges de statut
  const getStatusClass = (status) => {
    if (status === 'accepte' || status === 'approuvé') return 'green';
    if (status === 'en_attente') return 'blue';
    return 'red'; // pour refusé
  };

  return (
    <div className="secretaire-card">
      <div className="secretaire-header-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ color: '#1D837F', margin: 0 }}>Gestion de mes congés</h2>
        <button 
          type="button"
          className={showForm ? "secretaire-btn-secondary" : "secretaire-btn-primary"} 
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Annuler' : '+ Nouvelle demande'}
        </button>
      </div>

      {showForm && (
        <div style={{ background: '#F8FAFC', padding: '25px', borderRadius: '15px', marginBottom: '30px', border: '1px solid #E2E8F0' }}>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', alignItems: 'end' }}>
            <div className="form-group">
              <label className="secretaire-date-text">Type de congé</label>
              <select 
                className="secretaire-input" 
                value={formData.type_conge}
                onChange={(e) => setFormData({ ...formData, type_conge: e.target.value })}
                required
              >
                <option value="annuel">Annuel</option>
                <option value="maladie">Maladie</option>
                <option value="exceptionnel">Exceptionnel</option>
              </select>
            </div>
            <div className="form-group">
              <label className="secretaire-date-text">Date de début</label>
              <input 
                type="date" 
                className="secretaire-input" 
                value={formData.date_debut_conge}
                required 
                onChange={(e) => setFormData({ ...formData, date_debut_conge: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="secretaire-date-text">Date de fin</label>
              <input 
                type="date" 
                className="secretaire-input" 
                value={formData.date_fin_conge}
                required 
                onChange={(e) => setFormData({ ...formData, date_fin_conge: e.target.value })}
              />
            </div>
            <div style={{ gridColumn: 'span 3', textAlign: 'right', marginTop: '10px' }}>
              <button type="submit" className="secretaire-btn-primary" style={{ width: '200px' }}>
                Envoyer la demande
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="secretaire-table-container">
        <table className="secretaire-table">
          <thead>
            <tr>
              <th>TYPE</th>
              <th>DÉBUT</th>
              <th>FIN</th>
              <th style={{ textAlign: 'center' }}>STATUT</th>
            </tr>
          </thead>
          <tbody>
            {conges && conges.length > 0 ? conges.map((c) => (
              <tr key={c.id_demande || Math.random()}>
                <td><strong style={{ textTransform: 'capitalize' }}>{c.type_conge.replace('_', ' ')}</strong></td>
                <td>{new Date(c.date_debut_conge).toLocaleDateString('fr-FR')}</td>
                <td>{new Date(c.date_fin_conge).toLocaleDateString('fr-FR')}</td>
                <td style={{ textAlign: 'center' }}>
                  <span className={`secretaire-status ${getStatusClass(c.statut)}`}>
                    {c.statut.replace('_', ' ')}
                  </span>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>
                  Aucun historique de congé trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MesConges;