import React from 'react';
import './CongeManager.css';

const CongeManager = ({demandes, onApprove, onReject, currentUser, fetchData }) => {
  const isAdmin = currentUser?.role === 'admin';

  // Fonction pour calculer la durée
  const calculateDuration = (debut, fin) => {
    const start = new Date(debut);
    const end = new Date(fin);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const getStatusBadge = (statut) => {
    const badges = {
      en_attente: { text: 'En attente', class: 'status-pending' },
      accepte: { text: 'Accepté & Mail envoyé', class: 'status-approved' },
      refuse: { text: 'Refusé', class: 'status-rejected' }
    };
    return badges[statut] || badges.en_attente;
  };
  const handleDemanderConge = async (id_employer, congeData) => {
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch(`http://127.0.0.1:8000/rh/employer/${id_employer}/conge`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id_employer: id_employer,
        type_conge: congeData.type,
        date_debut_conge: congeData.debut,
        date_fin_conge: congeData.fin
      })
    });

    if (response.ok) {
      alert("Demande envoyée avec succès !");
      fetchData(); // Pour rafraîchir la liste et le calendrier
    } else {
      const error = await response.json();
      alert(`Erreur : ${error.detail}`);
    }
  } catch (err) {
    console.error("Erreur réseau :", err);
  }
};

  return (
    <div className="conge-manager">
      <div className="conge-header">
        <div>
          <h3>Visualisation des Congés</h3>
          <p>{demandes.length} demande(s) enregistrée(s)</p>
        </div>
      </div>

      <div className="conges-list">
        {demandes.length === 0 ? (
          <div className="empty-state">
            <p>Aucune demande de congé dans la base de données.</p>
          </div>
        ) : (
          demandes.map((demande) => {
            const badge = getStatusBadge(demande.statut);
            const duration = calculateDuration(demande.date_debut, demande.date_fin);
            
            return (
              <div key={demande.id_demande} className="conge-card">
                <div className="conge-info">
                  <div className="user-profile">
                    <strong>{demande.nom_utilisateur}</strong>
                    <span className="type-label">{demande.type_conge}</span>
                  </div>
                  
                  <div className="conge-dates">
                    <span>Du: {new Date(demande.date_debut).toLocaleDateString()}</span>
                    <span>Au: {new Date(demande.date_fin).toLocaleDateString()}</span>
                    <span className="duration-tag">{duration} jours</span>
                  </div>

                  <span className={`status-badge ${badge.class}`}>
                    {badge.text}
                  </span>
                </div>

                {isAdmin && demande.statut === 'en_attente' && (
                  <div className="conge-actions">
                    <button 
                      className="btn-approve" 
                      onClick={() => onApprove(demande.id_demande, demande.email)}
                      title="Accepter et envoyer un mail"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18">
                        <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                      </svg>
                      Accepter & Mail
                    </button>
                    <button 
                      className="btn-reject" 
                      onClick={() => onReject(demande.id_demande)}
                    >
                      Refuser
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CongeManager;