import React from 'react';
import './CalendrierConges.css';

const CalendrierConges = ({ demandes }) => {
  const congesValides = Array.isArray(demandes) 
    ? demandes.filter(d => d.statut === 'accepte') 
    : [];

  const aujourdhui = new Date();
  aujourdhui.setHours(0, 0, 0, 0);

  // Séparation des données pour une meilleure lecture
  const absentsMaintenant = congesValides.filter(d => {
    const debut = new Date(d.date_debut_conge || d.date_debut);
    const fin = new Date(d.date_fin_conge || d.date_fin);
    return aujourdhui >= debut && aujourdhui <= fin;
  });

  const absentsFuturs = congesValides.filter(d => {
    const debut = new Date(d.date_debut_conge || d.date_debut);
    return debut > aujourdhui;
  });

  const CardConge = ({ conge, type }) => (
    <div className={`calendar-item ${type}`}>
      <div className="calendar-user-info">
        <div className="avatar">{conge.nom_utilisateur?.charAt(0)}</div>
        <div>
          <h4>{conge.nom_utilisateur}</h4>
          <span>{conge.type_conge}</span>
        </div>
      </div>
      <div className="calendar-date-info">
        <p>Du {new Date(conge.date_debut_conge || conge.date_debut).toLocaleDateString()}</p>
        <p>au {new Date(conge.date_fin_conge || conge.date_fin).toLocaleDateString()}</p>
      </div>
    </div>
  );

  return (
    <div className="calendar-dashboard">
      <header className="calendar-header">
        <h2>État des effectifs</h2>
        <div className="stats-badges">
          <span className="badge present">En poste: {absentsMaintenant.length === 0 ? 'Total' : 'Effectif réduit'}</span>
          <span className="badge absent">En congé: {absentsMaintenant.length}</span>
        </div>
      </header>

      <div className="calendar-sections">
        {/* Section Absents maintenant */}
        <section className="calendar-section">
          <h3>🚫 Absences actuelles</h3>
          <div className="calendar-grid">
            {absentsMaintenant.length > 0 ? (
              absentsMaintenant.map(c => <CardConge key={c.id_demande} conge={c} type="now" />)
            ) : (
              <p className="empty-msg">Tout le monde est au poste aujourd'hui.</p>
            )}
          </div>
        </section>

        {/* Section Absences futures */}
        <section className="calendar-section">
          <h3>📅 Départs prévus</h3>
          <div className="calendar-grid">
            {absentsFuturs.length > 0 ? (
              absentsFuturs.map(c => <CardConge key={c.id_demande} conge={c} type="future" />)
            ) : (
              <p className="empty-msg">Aucun départ prévu prochainement.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default CalendrierConges;