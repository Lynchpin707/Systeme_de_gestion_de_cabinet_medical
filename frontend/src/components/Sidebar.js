import React from 'react';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose, type }) => {
  const content = {
    apropos: {
      title: "À Propos",
      subtitle: "Notre engagement envers votre santé",
      sections: [
        {
          number: "01",
          title: "Notre Mission",
          text: "Offrir des soins médicaux de qualité avec compassion et professionnalisme à tous nos patients."
        },
        {
          number: "02",
          title: "Notre Équipe",
          text: "Une équipe de professionnels qualifiés et dévoués, spécialisés dans diverses disciplines médicales."
        },
        {
          number: "03",
          title: "Nos Valeurs",
          text: "Excellence, Intégrité, Compassion et Innovation dans tous nos services de santé."
        },
        {
          number: "04",
          title: "Notre Histoire",
          text: "Depuis 2010, nous servons la communauté avec dévouement et nous nous engageons à améliorer la santé de nos patients."
        }
      ]
    },
    blog: {
      title: "Blog Médical",
      subtitle: "Actualités et conseils santé",
      sections: [
        {
          number: "01",
          title: "Conseils Santé",
          text: "Découvrez nos derniers articles sur la prévention, la nutrition et le bien-être au quotidien.",
          date: "15 Décembre 2024"
        },
        {
          number: "02",
          title: "Actualités Médicales",
          text: "Restez informé des dernières avancées médicales et des nouveaux traitements disponibles.",
          date: "10 Décembre 2024"
        },
        {
          number: "03",
          title: "Guides Pratiques",
          text: "Des guides complets pour mieux comprendre votre santé et prendre soin de vous.",
          date: "5 Décembre 2024"
        },
        {
          number: "04",
          title: "Témoignages Patients",
          text: "Lisez les expériences de nos patients et leur parcours de soins dans notre cabinet.",
          date: "1 Décembre 2024"
        }
      ]
    }
  };

  const currentContent = content[type] || content.apropos;

  if (!isOpen) return null;

  return (
    <>
      <div className={`elegant-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}></div>
      <div className={`elegant-sidebar ${isOpen ? 'active' : ''}`}>
        {/* Header élégant */}
        <div className="elegant-header">
          <div className="elegant-header-content">
            <div className="elegant-line"></div>
            <h2 className="elegant-title">{currentContent.title}</h2>
            <p className="elegant-subtitle">{currentContent.subtitle}</p>
          </div>
          <button className="elegant-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Contenu avec sections numérotées */}
        <div className="elegant-content">
          {currentContent.sections.map((section, index) => (
            <div key={index} className="elegant-section">
              <div className="section-number">{section.number}</div>
              <div className="section-body">
                <h3 className="section-title">{section.title}</h3>
                <p className="section-text">{section.text}</p>
                {section.date && (
                  <div className="section-date">{section.date}</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer minimaliste */}
        <div className="elegant-footer">
          <div className="footer-line"></div>
          <button className="elegant-back-btn" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Retour
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;