import React from 'react';
import './Hero.css';

const Hero = ({ onOpenLogin }) => {
  const handleCardClick = (cardType) => {
    console.log(`Tentative d'accès à : ${cardType}`);
    onOpenLogin();
  };
  return (
    <section className="hero">
      <div className="hero-content">
        <h1 className="hero-title">Votre santé, notre priorité</h1>
        <p className="hero-subtitle">Une équipe médicale dévouée à votre service</p>
        <div className="hero-cta">
          <div className="cta-card" onClick={() => handleCardClick('rendez-vous')}>
            <div className="cta-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              {/* <span className="cta-badge">Connexion requise</span> */}
            </div>
            <h3>Prise de rendez-vous</h3>
            <p>Consultez rapidement un professionnel de santé</p>
          </div>
          <div className="cta-card">
            <div className="cta-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
              </svg>
            </div>
            <h3>Contact rapide</h3>
            <p>Notre équipe est à votre écoute</p>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default Hero;
