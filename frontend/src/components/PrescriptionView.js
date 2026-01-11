import React, { useState, useEffect } from 'react';
import './VisiteMedicaleModal.css';

const PrescriptionView = ({ onBack, items, setItems, commentaireOrdonnance, setCommentaireOrdonnance }) => {
  const [activeType, setActiveType] = useState('med');
  const [medicaments, setMedicaments] = useState([]);
  const [analyses, setAnalyses] = useState([]);

  const [formData, setFormData] = useState({
    id_medicament: '', posologie: '', duree: '',
    zone_corps: '', date_prescription_Rad: new Date().toISOString().split('T')[0], commentaire_rad: '',
    id_analyse: '', description: ''
  });

  useEffect(() => {
    fetchMedicaments();
    fetchAnalyses();
  }, []);

  const fetchMedicaments = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://127.0.0.1:8000/ordonnances/medicaments`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setMedicaments(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchAnalyses = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://127.0.0.1:8000/ordonnances/analyses`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setAnalyses(await res.json());
    } catch (err) { console.error(err); }
  };

  const handleAdd = () => {
    const newItem = { id: Date.now(), type: activeType, ...formData };
    setItems([...items, newItem]);
    setFormData({ ...formData, id_medicament: '', posologie: '', duree: '', zone_corps: '', commentaire_rad: '', id_analyse: '', description: '' });
  };

  return (
    <div className="presc-view-wrapper">
      {/* HEADER SLIDING */}
      <div className="presc-header-slide">
        <button className="btn-circle-back" onClick={onBack} title="Retour">✕</button>
        <div className="presc-title-group">
          <h2>Nouvelle Prescription</h2>
          <p>Complétez les éléments de l'ordonnance ci-dessous</p>
        </div>
      </div>

      {/* SELECTEUR COULISSANT (TABS) */}
      <div className="sliding-tabs-container">
        <button className={activeType === 'med' ? 'tab-item active' : 'tab-item'} onClick={() => setActiveType('med')}>💊 Médicaments</button>
        <button className={activeType === 'analyse' ? 'tab-item active' : 'tab-item'} onClick={() => setActiveType('analyse')}>🧪 Analyses</button>
        <button className={activeType === 'radio' ? 'tab-item active' : 'tab-item'} onClick={() => setActiveType('radio')}>🩻 Radiologie</button>
      </div>

      {/* FORMULAIRE DYNAMIQUE */}
      <div className="presc-form-card">
        <div className="dynamic-input-grid">
          {activeType === 'med' && (
            <>
              <select className="presc-input" value={formData.id_medicament} onChange={e => setFormData({...formData, id_medicament: e.target.value})}>
                <option value="">Choisir un médicament...</option>
                {medicaments.map(med => <option key={med.id_medicament} value={med.id_medicament}>{med.nom_medicament}</option>)}
              </select>
              <input className="presc-input" placeholder="Posologie (ex: 1 mat/soir)" value={formData.posologie} onChange={e => setFormData({...formData, posologie: e.target.value})} />
              <input className="presc-input" placeholder="Durée (ex: 7 jours)" value={formData.duree} onChange={e => setFormData({...formData, duree: e.target.value})} />
            </>
          )}

          {activeType === 'radio' && (
            <>
              <input className="presc-input" placeholder="Zone du corps" value={formData.zone_corps} onChange={e => setFormData({...formData, zone_corps: e.target.value})} />
              <input className="presc-input" type="date" value={formData.date_prescription_Rad} onChange={e => setFormData({...formData, date_prescription_Rad: e.target.value})} />
              <input className="presc-input full-width" placeholder="Commentaire / Indication pour le radiologue" value={formData.commentaire_rad} onChange={e => setFormData({...formData, commentaire_rad: e.target.value})} />
            </>
          )}

          {activeType === 'analyse' && (
            <>
              <select className="presc-input" value={formData.id_analyse} onChange={e => setFormData({...formData, id_analyse: e.target.value})}>
                <option value="">Choisir une analyse...</option>
                {analyses.map(an => <option key={an.id_analyse} value={an.id_analyse}>{an.nom_analyse}</option>)}
              </select>
              <input className="presc-input full-width" placeholder="Description / Précisions" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            </>
          )}
        </div>
        <button className="btn-add-presc" onClick={handleAdd}>+ Ajouter à la liste</button>
      </div>

      {/* TABLEAU RÉCAPITULATIF */}
      <div className="presc-preview-table-wrapper">
        <table className="presc-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Détails de l'élément</th>
              <th>Notes / MLD</th>
              <th style={{ textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td><span className={`badge-pill type-${item.type}`}>{item.type}</span></td>
                <td className="detail-cell">
                  {item.type === 'med' && <strong>{medicaments.find(m => m.id_medicament == item.id_medicament)?.nom_medicament}</strong>}
                  {item.type === 'med' && <span> ({item.posologie} - {item.duree})</span>}
                  {item.type === 'radio' && <strong>{item.zone_corps}</strong>}
                  {item.type === 'analyse' && <strong>{analyses.find(a => a.id_analyse == item.id_analyse)?.nom_analyse}</strong>}
                </td>
                <td>{item.commentaire_rad || item.description || "-"}</td>
                <td style={{ textAlign: 'center' }}>
                  <button className="btn-delete-item" onClick={() => setItems(items.filter(i => i.id !== item.id))}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="presc-footer-note">
        <div className="presc-footer-note">
  <div className="comment-header">
    <span className="comment-icon">📝</span>
    <label>Commentaire général & Conseils thérapeutiques</label>
  </div>
  <textarea 
    placeholder="Conseils alimentaires, hygiène de vie, repos, date du prochain contrôle..." 
    value={commentaireOrdonnance} 
    onChange={(e) => setCommentaireOrdonnance(e.target.value)}
    className="presc-textarea"
  />
  <div className="textarea-footer">
    <span>Ce commentaire sera imprimé au bas de l'ordonnance officielle.</span>
  </div>
</div>
      </div>
    </div>
  );
};

export default PrescriptionView;