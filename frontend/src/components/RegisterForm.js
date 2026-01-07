import React, { useState } from 'react';
import './RegisterForm.css';

const RegisterForm = ({ onBack, onSuccess }) => {
  const [formData, setFormData] = useState({
    nom_utilisateur: '',
    prenom_utilisateur: '',
    email: '',
    password: '',
    confirmPassword: '',
    numero_tlp: '',
    dateNaissance: '',
    genre: '',
    adresse: '',
    medecin_traitant: '',
    couverture_medicale: ''
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setServerError('');

    // Validation locale
    const newErrors = {};
    if (!formData.nom_utilisateur.trim()) newErrors.nom_utilisateur = 'Le nom est requis';
    if (!formData.prenom_utilisateur.trim()) newErrors.prenom_utilisateur = 'Le prénom est requis';
    if (!formData.email.trim()) newErrors.email = 'L\'email est requis';
    if (formData.password.length < 6) newErrors.password = 'Minimum 6 caractères';
    if (!formData.dateNaissance) newErrors.dateNaissance = 'Requis';
    if (!formData.genre) newErrors.genre = 'Requis';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      // Concaténation pour respecter votre classe UtilisateurCreate
      const nomComplet = `${formData.prenom_utilisateur} ${formData.nom_utilisateur}`;

      const response = await fetch('http://127.0.0.1:8000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom_utilisateur: `${formData.prenom_utilisateur} ${formData.nom_utilisateur}`,
          email: formData.email,
          numero_tl: parseInt(formData.numero_tlp) || 0, // Sera ignoré ou mis dans Utilisateur
          adresse: formData.adresse || "Non renseignée",
          genre: formData.genre,
          date_de_naissance: formData.dateNaissance,
          mot_de_passe: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const userWithRole = { ...data.user, roles: ['patient'] };
        onSuccess(userWithRole);
        const { saveCurrentUser } = await import('../utils/auth');
        saveCurrentUser(userWithRole);
        if (window.onAdminLogin) window.onAdminLogin(userWithRole);
      } else {
        if (Array.isArray(data.detail)) {
          setServerError(data.detail[0].msg);
        } else {
          setServerError(data.detail || "Erreur lors de l'inscription");
        }
      }
    } catch (err) {
      setServerError("Impossible de contacter le serveur.");
    }
  };


  return (
    <div className="register-form-container">
      <div className="register-header">
        <button className="back-btn" onClick={onBack}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <div>
          <h2>Créer un compte patient</h2>
          <p>Remplissez le formulaire ci-dessous</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="register-form">
        {serverError && <div className="error-message server-error" style={{color: 'red', fontWeight: 'bold', marginBottom: '15px'}}>⚠️ {serverError}</div>}
        
        <div className="form-section">
          <h3>Informations personnelles</h3>
          <div className="form-row">
            <div className="form-field">
              <label>Nom *</label>
              <input type="text" name="nom_utilisateur" value={formData.nom_utilisateur} onChange={handleChange} className={errors.nom_utilisateur ? 'error' : ''} />
              {errors.nom_utilisateur && <span className="error-message">{errors.nom_utilisateur}</span>}
            </div>
            <div className="form-field">
              <label>Prénom *</label>
              <input type="text" name="prenom_utilisateur" value={formData.prenom_utilisateur} onChange={handleChange} className={errors.prenom_utilisateur ? 'error' : ''} />
              {errors.prenom_utilisateur && <span className="error-message">{errors.prenom_utilisateur}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Email *</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className={errors.email ? 'error' : ''} />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>
            <div className="form-field">
              <label>Téléphone *</label>
              <input type="number" name="numero_tlp" value={formData.numero_tlp} onChange={handleChange} placeholder="06XXXXXXXX" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Date de naissance *</label>
              <input type="date" name="dateNaissance" value={formData.dateNaissance} onChange={handleChange} className={errors.dateNaissance ? 'error' : ''} />
            </div>
            <div className="form-field">
              <label>Genre *</label>
              <select name="genre" value={formData.genre} onChange={handleChange} className={errors.genre ? 'error' : ''}>
                <option value="">Sélectionner</option>
                <option value="Homme">Homme</option>
                <option value="Femme">Femme</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Sécurité</h3>
          <div className="form-row">
            <div className="form-field">
              <label>Mot de passe *</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} className={errors.password ? 'error' : ''} />
            </div>
            <div className="form-field">
              <label>Confirmer *</label>
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className={errors.confirmPassword ? 'error' : ''} />
            </div>
          </div>
        </div>

        <button type="submit" className="submit-register-btn">Créer mon compte</button>
      </form>
    </div>
  );
};

export default RegisterForm;