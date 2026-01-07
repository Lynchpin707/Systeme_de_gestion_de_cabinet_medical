import React, { useState } from 'react';
import './ActesMedicauxManager.css';

const ActesMedicauxManager = ({ actes, onAdd, onUpdate, onDelete }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingActe, setEditingActe] = useState(null);
  const [formData, setFormData] = useState({
    nom_acte: '',
    tarif: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingActe) {
      onUpdate({ ...editingActe, ...formData });
      setEditingActe(null);
    } else {
      onAdd(formData);
    }
    setFormData({ nom_acte: '', tarif: '' });
    setShowAddForm(false);
  };

  const handleEdit = (acte) => {
    setEditingActe(acte);
    setFormData({
      nom_acte: acte.nom_acte,
      tarif: acte.tarif
    });
    setShowAddForm(true);
  };

  return (
    <div className="actes-manager">
      <div className="actes-header">
        <h3>Catalogue des Actes Médicaux</h3>
        <button 
          className="btn-add-acte" 
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? 'Annuler' : '+ Ajouter un acte'}
        </button>
      </div>

      {showAddForm && (
        <form className="acte-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nom de l'acte"
            value={formData.nom_acte}
            onChange={(e) => setFormData({ ...formData, nom_acte: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Tarif (MAD)"
            value={formData.tarif}
            onChange={(e) => setFormData({ ...formData, tarif: e.target.value })}
            required
          />
          <button type="submit" className="btn-save">
            {editingActe ? 'Modifier' : 'Ajouter'}
          </button>
        </form>
      )}

      <div className="actes-list">
        {actes.map(acte => (
          <div key={acte.id_acte} className="acte-card">
            <div className="acte-info">
              <h4>{acte.nom_acte}</h4>
              <span className="acte-tarif">{acte.tarif} MAD</span>
            </div>
            <div className="acte-actions">
              <button onClick={() => handleEdit(acte)}>✏️</button>
              <button onClick={() => onDelete(acte.id_acte)}>🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActesMedicauxManager;