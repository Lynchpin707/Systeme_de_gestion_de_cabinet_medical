import React, { useState } from 'react';
import './CatalogueManager.css';

const CatalogueManager = ({ catalogues, fetchData }) => {
  const [showActeForm, setShowActeForm] = useState(false);
  const [selectedCatalogue, setSelectedCatalogue] = useState(null);
  
  const [acteData, setActeData] = useState({
    nom_acte: '',
    code_acte: '',
    prix: '',
    id_catalogue: ''
  });
const handleDeleteTarif = async (id_tarifier) => {
  if (!window.confirm("Êtes-vous sûr de vouloir retirer cet acte du catalogue ?")) return;

  const token = localStorage.getItem('token');
  try {
    const response = await fetch(`http://127.0.0.1:8000/catalogue/tarifer/${id_tarifier}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      // Rafraîchir les données pour mettre à jour les tableaux
      fetchData();
    } else {
      alert("Erreur lors de la suppression");
    }
  } catch (err) {
    console.error("Erreur réseau :", err);
  }
};
const handleAddActe = async (e) => {
  e.preventDefault();
  const token = localStorage.getItem('token');
  
  try {
    // ÉTAPE 1 : Créer l'acte médical
    const resActe = await fetch('http://127.0.0.1:8000/catalogue/actes', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ 
        nom_acte: acteData.nom_acte, 
        code_acte: acteData.code_acte 
      })
    });

    if (!resActe.ok) throw new Error("Erreur lors de la création de l'acte");
    const newActe = await resActe.json();

    // ÉTAPE 2 : Fixer le prix dans le catalogue (Tarification)
    const resTarif = await fetch('http://127.0.0.1:8000/catalogue/tarifer', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${localStorage.getItem('token')}` 
      },
      body: JSON.stringify({ 
        id_catalogue: parseInt(acteData.id_catalogue), // Forcer l'entier
        id_acte: newActe.id_acte, 
        prix: parseFloat(acteData.prix) // Forcer le float
      })
    });

    if (resTarif.ok) {
      alert("Acte ajouté et tarifé avec succès !");
      fetchData(); // Rafraîchit les tableaux
      setShowActeForm(false);
      setActeData({ nom_acte: '', code_acte: '', prix: '', id_catalogue: '' });
    }
  } catch (err) {
    console.error("Erreur:", err);
    alert("Impossible d'ajouter l'acte. Vérifiez la console.");
  }
};

  return (
    <div className="catalogue-container">
      <div className="catalogue-header">
        <h2>Gestion des Tarifs & Actes</h2>
        <button className="btn-add" onClick={() => setShowActeForm(!showActeForm)}>
          {showActeForm ? 'Annuler' : '+ Nouvel Acte'}
        </button>
      </div>

      {showActeForm && (
        <form className="acte-form-box" onSubmit={handleAddActe}>
          <input placeholder="Nom de l'acte (ex: ECG)" required 
            onChange={e => setActeData({...acteData, nom_acte: e.target.value})} />
          <input placeholder="Code (ex: CCAM_001)" required 
            onChange={e => setActeData({...acteData, code_acte: e.target.value})} />
          <input type="number" placeholder="Prix en DH" required 
            onChange={e => setActeData({...acteData, prix: e.target.value})} />
          <select required onChange={e => setActeData({...acteData, id_catalogue: e.target.value})}>
            <option value="">Choisir un catalogue...</option>
            {catalogues.map(cat => (
              <option key={cat.id_catalogue} value={cat.id_catalogue}>{cat.nom_catalogue}</option>
            ))}
          </select>
          <button type="submit" className="btn-submit">Enregistrer l'acte</button>
        </form>
      )}

<div className="catalogues-grid">
  {catalogues.map(cat => (
    <div key={cat.id_catalogue} className="catalogue-section">
      <h3 className="cat-title">{cat.nom_catalogue}</h3>
      <table className="acte-table">
        <thead>
          <tr>
            <th>Code</th>
            <th>Désignation</th>
            <th>Prix</th>
            <th>Actions</th> {/* 1. Nouvelle colonne En-tête */}
          </tr>
        </thead>
        <tbody>
          {cat.tarifs?.map(t => (
            <tr key={t.id_tarifier}>
              <td><code>{t.acte?.code_acte}</code></td>
              <td>{t.acte?.nom_acte}</td>
              <td className="price-cell">{t.prix} DH</td>
              <td>
                {/* 2. Bouton de suppression */}
                <button 
                  className="btn-delete-acte"
                  onClick={() => handleDeleteTarif(t.id_tarifier)}
                  title="Supprimer du catalogue"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ))}
</div>
    </div>
  );
};

export default CatalogueManager;