import React, { useState, useEffect } from 'react';
import RegisterForm from './RegisterForm';
import './LoginModal.css';

const LoginModal = ({ isOpen, onClose }) => {
  const [userType, setUserType] = useState('patient'); // 'patient' or 'employee'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [errorMessage, setErrorMessage] = useState(''); 

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // --- Connexion au Backend FastAPI ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(''); 
    
    try {
      const params = new URLSearchParams();
      params.append('username', formData.email);
      params.append('password', formData.password);
      // ON AJOUTE LE SCOPE ICI
      params.append('scope', userType); 

      const response = await fetch('http://127.0.0.1:8000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params
      });
      const data = await response.json();

      // --- Dans handleSubmit ---
      if (response.ok) {
        // 1. Sauvegarder le token ET les infos utilisateur
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user)); // Persistance ici

        const userWithRole = {
          ...data.user,
          roles: [data.user.role]
        };

        onClose();
        
        // 2. Notifier l'application (App.js)
        if (window.onAdminLogin) {
          window.onAdminLogin(userWithRole);
        }
        
        setFormData({ email: '', password: '', remember: false });
      } else {
        // Gestion propre de l'erreur pour éviter le crash "Objects are not valid"
        const detail = data.detail;
        setErrorMessage(typeof detail === 'object' ? (detail[0]?.msg || "Erreur") : detail);
      }
    } catch (err) {
      setErrorMessage('Impossible de contacter le serveur backend.');
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`login-modal ${isOpen ? 'active' : ''}`} onClick={handleBackdropClick}>
      <div className="login-modal-content single-panel">
        <button className="close-modal" onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </button>

        <div className="login-right-panel">
          {showRegister ? (
            <RegisterForm 
              onBack={() => setShowRegister(false)}
              onSuccess={(newPatient) => {
                console.log('Nouveau patient créé:', newPatient);
                setShowRegister(false);
                onClose();
                alert(`Bienvenue ${newPatient.prenom_utilisateur} ! Votre compte a été créé avec succès.`);
              }}
            />
          ) : (
            <>
              <div className="login-header-title">
                <h2>Connexion</h2>
                <p>Accédez à votre espace</p>
              </div>

              <div className="user-type-selector">
                <button
                  type="button"
                  className={`user-type-btn ${userType === 'patient' ? 'active' : ''}`}
                  onClick={() => setUserType('patient')}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  <span>Patient</span>
                </button>
                <button
                  type="button"
                  className={`user-type-btn ${userType === 'employee' ? 'active' : ''}`}
                  onClick={() => setUserType('employee')}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  <span>Employé</span>
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="login-form-group">
                  <label htmlFor="modal-email">Adresse email</label>
                  <div className="login-input-wrapper">
                    <div className="login-input-icon">
                      <svg viewBox="0 0 24 24">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                      </svg>
                    </div>
                    <input
                      type="email"
                      id="modal-email"
                      name="email"
                      className="login-input"
                      placeholder="exemple@cabinet-medical.fr"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="login-form-group">
                  <label htmlFor="modal-password">Mot de passe</label>
                  <div className="login-input-wrapper">
                    <div className="login-input-icon">
                      <svg viewBox="0 0 24 24">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0110 0v4"/>
                      </svg>
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="modal-password"
                      name="password"
                      className="login-input"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                    <button
                      type="button"
                      className="login-password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <svg viewBox="0 0 24 24">
                        {showPassword ? (
                          <>
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                            <line x1="1" y1="1" x2="23" y2="23"/>
                          </>
                        ) : (
                          <>
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                          </>
                        )}
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="login-form-options">
                  <div className="login-remember-me">
                    <input
                      type="checkbox"
                      id="modal-remember"
                      name="remember"
                      checked={formData.remember}
                      onChange={handleChange}
                    />
                    <label htmlFor="modal-remember">Se souvenir de moi</label>
                  </div>
                  <a href="#forgot" className="login-forgot-password">Mot de passe oublié ?</a>
                </div>

                {errorMessage && (
                  <div className="error-message">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="12"/>
                      <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    {errorMessage}
                  </div>
                )}

                <button type="submit" className="login-submit-btn">
                  Se connecter en tant que {userType === 'patient' ? 'Patient' : 'Employé'}
                </button>
              </form>

              {userType === 'patient' && (
                <div className="login-footer">
                  <p>Première visite ?</p>
                  <button 
                    type="button" 
                    className="create-account-btn"
                    onClick={() => setShowRegister(true)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="8.5" cy="7" r="4"/>
                      <line x1="20" y1="8" x2="20" y2="14"/>
                      <line x1="23" y1="11" x2="17" y2="11"/>
                    </svg>
                    Créer un compte patient
                  </button>
                </div>
              )}

              {userType === 'employee' && (
                <div className="login-footer">
                  <p>Vous êtes un professionnel ? Contactez l'administrateur pour obtenir vos accès.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginModal;