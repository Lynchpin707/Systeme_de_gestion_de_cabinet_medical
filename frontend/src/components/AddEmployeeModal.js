import React, { useState,useEffect } from 'react';
import './AddModal.css';

const AddEmployeeModal = ({ isOpen, onClose, onAdd, initialData }) => { // Ajoute initialData ici
  const [formData, setFormData] = useState({
    nom_utilisateur: '',
    prenom_utilisateur: '',
    email: '',
    numero_tlp: '',
    adresse: '',
    genre: '',
    dateNaissance: '',
    role: 'medecin',
    salaire: '',
    statut: 'actif',
    specialite: ''
  });
  
useEffect(() => {
    if (initialData) {
      setFormData(initialData); // Remplit le formulaire si on modifie
    } else {
      // Vide le formulaire si c'est un nouvel ajout
      setFormData({
        nom_utilisateur: '', prenom_utilisateur: '', email: '', 
        numero_tlp: '', adresse: '', genre: '', 
        dateNaissance: '', role: 'medecin', salaire: '', 
        statut: 'actif', specialite: ''
      });
    }
  }, [initialData, isOpen]);
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
  if (!formData.genre) newErrors.genre = 'Requis';
  if (formData.role === 'medecin' && !formData.specialite.trim()) {
    newErrors.specialite = 'Requis pour médecin';
  }
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      const token = localStorage.getItem('token');
      
      // Adaptation au schéma Pydantic 'UtilisateurCreate'
      const payload = {
        nom_utilisateur: `${formData.nom_utilisateur} ${formData.prenom_utilisateur}`,
        email: formData.email,
        numero_tl: parseInt(formData.numero_tlp.replace(/\s/g, '')), // Convertit en entier
        adresse: formData.adresse || "Non spécifiée",
        genre: formData.genre,
        date_de_naissance: formData.dateNaissance || "1990-01-01", // Format YYYY-MM-DD
        mot_de_passe: "Cabinet2026!" // Mot de passe par défaut pour les nouveaux
      };

      try {
        const response = await fetch(`http://127.0.0.1:8000/utilisateurs/employes?role=${formData.role}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          onAdd(); // Appelle fetchData() du dashboard
          onClose();
          // Réinitialisation
          setFormData({
            nom_utilisateur: '', prenom_utilisateur: '', email: '', 
            numero_tlp: '', adresse: '', genre: '', 
            dateNaissance: '', role: 'medecin', salaire: '', 
            statut: 'actif', specialite: ''
          });
        } else {
          const errorData = await response.json();
          alert(`Erreur: ${errorData.detail}`);
        }
      } catch (err) {
        console.error("Erreur réseau:", err);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Ajouter un Employé</h2>
            <p>Remplissez les informations du nouvel employé</p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="role-selector">
            <button
              type="button"
              className={`role-btn ${formData.role === 'medecin' ? 'active' : ''}`}
              onClick={() => setFormData({ ...formData, role: 'medecin' })}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                <path d="M9 12l2 2 4-4"/>
              </svg>
              Médecin
            </button>
            <button
              type="button"
              className={`role-btn ${formData.role === 'secretaire' ? 'active' : ''}`}
              onClick={() => setFormData({ ...formData, role: 'secretaire', specialite: '' })}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              Secrétaire
            </button>
          </div>

          <div className="form-grid">
  <div className="form-field">
    <label>Nom *</label>
    <input
      type="text"
      name="nom_utilisateur"
      value={formData.nom_utilisateur}
      onChange={handleChange}
      placeholder="Nom de l'employé"
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
      placeholder="Prénom de l'employé"
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
    <label>Date de naissance</label>
    <input
      type="date"
      name="dateNaissance"
      value={formData.dateNaissance}
      onChange={handleChange}
    />
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

  {formData.role === 'medecin' && (
    <div className="form-field">
      <label>Spécialité *</label>
      <select
        name="specialite"
        value={formData.specialite}
        onChange={handleChange}
        className={errors.specialite ? 'error' : ''}
      >
        <option value="">Sélectionner</option>
        <option value="Généraliste">Généraliste</option>
        <option value="Cardiologue">Cardiologue</option>
        <option value="Dermatologue">Dermatologue</option>
        <option value="Pédiatre">Pédiatre</option>
        <option value="Gynécologue">Gynécologue</option>
        <option value="Dentiste">Dentiste</option>
        <option value="ORL">ORL</option>
        <option value="Ophtalmologue">Ophtalmologue</option>
      </select>
      {errors.specialite && <span className="field-error">{errors.specialite}</span>}
    </div>
  )}

  <div className="form-field">
    <label>Salaire (MAD)</label>
    <input
      type="number"
      name="salaire"
      value={formData.salaire}
      onChange={handleChange}
      placeholder="15000"
    />
  </div>

  <div className="form-field">
    <label>Statut</label>
    <select
      name="statut"
      value={formData.statut}
      onChange={handleChange}
    >
      <option value="actif">Actif</option>
      <option value="congé">En congé</option>
      <option value="inactif">Inactif</option>
    </select>
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
</div>
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="btn-submit">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              Ajouter l'employé
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmployeeModal;