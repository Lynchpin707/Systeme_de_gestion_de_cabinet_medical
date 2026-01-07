import React, { useState } from 'react';
import './Header.css';

const Header = ({ onOpenLogin, onOpenSidebar }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLoginClick = (e) => {
    e.preventDefault();
    onOpenLogin();
    setIsMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="nav-container">
        <div className="logo-section">
          <div className="logo-icon">
       <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#2D9DA0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
  <path d="M12 7v4M10 9h4"/>
</svg>
          </div>
          <span className="logo-text">Cabinet Médical</span>
        </div>

        <nav>
          <ul className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
            <li className="nav-item"><a href="#accueil">ACCUEIL</a></li>
            {/* <li className="nav-item"><a href="#specialites">SPÉCIALITÉS</a></li> */}
            <li className="nav-item"><a href="#docteurs">DOCTEURS</a></li>
           <li className="nav-item"><a href="#apropos" onClick={(e) => { e.preventDefault(); onOpenSidebar('apropos'); }}>À PROPOS</a></li>
            <li className="nav-item"><a href="#blog" onClick={(e) => { e.preventDefault(); onOpenSidebar('blog'); }}>BLOG</a></li>
            <li className="nav-item">
              <a href="#login" className="session-btn" onClick={handleLoginClick}>
                OUVRIR UNE SESSION
              </a>
            </li>
          </ul>
        </nav>

        <button className="mobile-menu-toggle" onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>
  );
};

export default Header;
