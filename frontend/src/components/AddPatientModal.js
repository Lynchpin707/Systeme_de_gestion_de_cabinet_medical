import React, { useState } from 'react';
import './AddModal.css';

const AddPatientModal = ({ isOpen, onClose, onAdd }) => {
const [formData, setFormData] = useState({
  nom_utilisateur: '',
  prenom_utilisateur: '',
  email: '',
  numero_tlp: '',
  adresse: '',
  genre: '',
  dateNaissance: '',
  medecin_traitant: '',
  couverture_medicale: ''
});

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

 const validate = () => {
  const newErrors = {};
  if (!formData.nom_utilisateur.trim()) newErrors.nom_utilisateur = 'Requis';
  if (!formData.prenom_utilisateur.trim()) newErrors.prenom_utilisateur = 'Requis';
  if (!formData.email.trim()) newErrors.email = 'Requis';
  if (!formData.numero_tlp.trim()) newErrors.numero_tlp = 'Requis';
  if (!formData.dateNaissance) newErrors.dateNaissance = 'Requis';
  if (!formData.genre) newErrors.genre = 'Requis';
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

  const handleSubmit = (e) => {
  e.preventDefault();
  if (validate()) {
    onAdd(formData);
    setFormData({
      nom_utilisateur: '', prenom_utilisateur: '', email: '', numero_tlp: '',
      adresse: '', genre: '', dateNaissance: '', role: 'medecin',
      salaire: '', statut: 'actif', specialite: ''
    });
    onClose();
  }
};

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Ajouter un Patient</h2>
            <p>Remplissez les informations du nouveau patient</p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grid">
  <div className="form-field">
    <label>Nom *</label>
    <input
      type="text"
      name="nom_utilisateur"
      value={formData.nom_utilisateur}
      onChange={handleChange}
      placeholder="Nom du patient"
      className={errors.nom_utilisateur ? 'error' : ''}
    />
    {errors.nom_utilisateur && <span className="field-error">{errors.nom_utilisateur}</span>}
  </div>

  <div className="form-field">
    <label>Prénom *</label>
    <input
      type="text"
      name="prenom_utilisateur"
      value={formData.prenom_utilisateur}
      onChange={handleChange}
      placeholder="Prénom du patient"
      className={errors.prenom_utilisateur ? 'error' : ''}
    />
    {errors.prenom_utilisateur && <span className="field-error">{errors.prenom_utilisateur}</span>}
  </div>

  <div className="form-field">
    <label>Email *</label>
    <input
      type="email"
      name="email"
      value={formData.email}
      onChange={handleChange}
      placeholder="email@exemple.com"
      className={errors.email ? 'error' : ''}
    />
    {errors.email && <span className="field-error">{errors.email}</span>}
  </div>

  <div className="form-field">
    <label>Téléphone *</label>
    <input
      type="tel"
      name="numero_tlp"
      value={formData.numero_tlp}
      onChange={handleChange}
      placeholder="06 12 34 56 78"
      className={errors.numero_tlp ? 'error' : ''}
    />
    {errors.numero_tlp && <span className="field-error">{errors.numero_tlp}</span>}
  </div>

  <div className="form-field">
    <label>Date de naissance *</label>
    <input
      type="date"
      name="dateNaissance"
      value={formData.dateNaissance}
      onChange={handleChange}
      className={errors.dateNaissance ? 'error' : ''}
    />
    {errors.dateNaissance && <span className="field-error">{errors.dateNaissance}</span>}
  </div>

  <div className="form-field">
    <label>Genre *</label>
    <select
      name="genre"
      value={formData.genre}
      onChange={handleChange}
      className={errors.genre ? 'error' : ''}
    >
      <option value="">Sélectionner</option>
      <option value="Homme">Homme</option>
      <option value="Femme">Femme</option>
    </select>
    {errors.genre && <span className="field-error">{errors.genre}</span>}
  </div>

  <div className="form-field full-width">
    <label>Adresse</label>
    <input
      type="text"
      name="adresse"
      value={formData.adresse}
      onChange={handleChange}
      placeholder="Adresse complète"
    />
  </div>

  <div className="form-field">
    <label>Médecin traitant</label>
    <input
      type="text"
      name="medecin_traitant"
      value={formData.medecin_traitant}
      onChange={handleChange}
      placeholder="Nom du médecin"
    />
  </div>

  <div className="form-field">
    <label>Couverture médicale</label>
    <select
      name="couverture_medicale"
      value={formData.couverture_medicale}
      onChange={handleChange}
    >
      <option value="">Sélectionner</option>
      <option value="CNSS">CNSS</option>
      <option value="CNOPS">CNOPS</option>
      <option value="Mutuelle">Mutuelle</option>
      <option value="Assurance privée">Assurance privée</option>
      <option value="Aucune">Aucune</option>
    </select>
  </div>
</div>
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="btn-submit">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              Ajouter le patient
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPatientModal;