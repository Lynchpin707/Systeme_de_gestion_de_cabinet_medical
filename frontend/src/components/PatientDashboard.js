import React, { useState, useEffect, useCallback } from 'react';
import './PatientDashboard.css';

const PatientDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('mon-agenda');
  const [dbAppointments, setDbAppointments] = useState([]);
  const [dbVisits, setDbVisits] = useState([]);
  const [medecinTraitant, setMedecinTraitant] = useState(null);
  const [derniereVisite, setDerniereVisite] = useState(null);
  const [factures, setFactures] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- ÉTATS POUR LA MODIFICATION ---
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    date_rdv: '',
    heure_rdv: '',
  });

  const patientId = user?.id_patient || user?.id_utilisateur || user?.id;

  // Mise en fonction pour pouvoir la réappeler après une action
const fetchPatientData = useCallback(async () => {
      const token = localStorage.getItem('token');
      if (!token || !patientId) {
        setLoading(false);
        return;
      }

      const headers = { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json' 
      };

      try {
        setLoading(true);
        const [resRdv, resVisites, resMed, resFact, resVisite] = await Promise.all([
          fetch(`http://127.0.0.1:8000/visites/mes-rdv?id_patient=${patientId}`, { headers }),
          fetch(`http://127.0.0.1:8000/visites/mes-visites?id_patient=${patientId}`, { headers }),
          // Vérifiez que cette URL correspond bien à votre nouveau endpoint
          fetch(`http://127.0.0.1:8000/patients/${patientId}/medecin`, { headers }), 
          fetch(`http://127.0.0.1:8000/factures/patient/${patientId}`, { headers }),
          fetch(`http://127.0.0.1:8000/patients/${patientId}/derniere-visite`, { headers })
        ]);

        if (resRdv.ok) setDbAppointments(await resRdv.json());
        if (resVisites.ok) setDbVisits(await resVisites.json());
        
        // MODIFICATION ICI : Ajout d'un log pour vérifier la structure reçue
        if (resMed.ok) {
          const medData = await resMed.json();
          console.log("Médecin chargé :", medData); // Pour debug
          setMedecinTraitant(medData); 
        } else {
          console.error("Erreur lors du chargement du médecin");
          setMedecinTraitant(null); // Reset si erreur
        }

        if (resFact.ok) setFactures(await resFact.json());
        if (resVisite.ok) setDerniereVisite(await resVisite.json());

      } catch (error) {
        console.error("Erreur de connexion API:", error);
      } finally {
        setLoading(false);
      }
    }, [patientId]);

  useEffect(() => {
    fetchPatientData();
  }, [fetchPatientData]);

  // --- LOGIQUE AGENDA (ANNULATION / MODIFICATION) ---

  const handleAnnuler = async (idRDV) => {
    if (window.confirm("Voulez-vous vraiment annuler ce rendez-vous ?")) {
      try {
        const response = await fetch(`http://127.0.0.1:8000/visites/rdv/${idRDV}/annuler`, {
          method: 'PATCH',
        });
        if (response.ok) {
          fetchPatientData();
          alert("Rendez-vous annulé avec succès");
        }
      } catch (error) {
        console.error("Erreur lors de l'annulation:", error);
      }
    }
  };

  const handleModifier = (rdv) => {
    setFormData({
      date_rdv: rdv.date_rdv,
      heure_rdv: rdv.heure_rdv.substring(0, 5), // Assure le format HH:mm pour l'input
    });
    setEditingId(rdv.id_RDV);
    setActiveTab('prendre-rdv'); // Redirige vers le formulaire
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmitRDV = async (e) => {
  e.preventDefault();
  
  // Utilise l'ID provenant du dictionnaire simplifié renvoyé par votre backend
  const idMedecinFinal = medecinTraitant?.id_medecin;

  if (!idMedecinFinal) {
    alert("Erreur : Impossible de récupérer l'identifiant de votre médecin.");
    return;
  }

  const payload = {
    ...formData,
    id_patient: patientId,
    id_medecin: idMedecinFinal,
    statut: "Prévu"
  };

  try {
    const url = editingId 
      ? `http://127.0.0.1:8000/visites/rdv/${editingId}/modifier` 
      : `http://127.0.0.1:8000/visites/rdv`;

    const response = await fetch(url, {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      alert(editingId ? "Rendez-vous modifié !" : "Rendez-vous pris !");
      setEditingId(null);
      fetchPatientData(); 
      setActiveTab('mon-agenda');
    } else {
      const err = await response.json();
      alert(err.detail || "Erreur lors de l'opération");
    }
  } catch (error) {
    console.error("Erreur formulaire:", error);
  }
};

  const peutPrendreControle = derniereVisite?.delaiControle <= 15;
  const aDejaRDV = dbAppointments.length > 0;

  if (loading) return <div className="loading-overlay">Chargement de votre espace...</div>;

  return (
    <div className="patient-dashboard">
      <aside className="patient-sidebar">
        <div className="patient-logo">
          <div className="logo-icon">
            <svg viewBox="0 0 24 24" fill="white"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <span>Espace Patient</span>
        </div>

        <nav className="patient-nav">
          <button className={`nav-btn ${activeTab === 'mon-agenda' ? 'active' : ''}`} onClick={() => setActiveTab('mon-agenda')}>Mon Agenda</button>
          <button className={`nav-btn ${activeTab === 'prendre-rdv' ? 'active' : ''}`} onClick={() => { setActiveTab('prendre-rdv'); setEditingId(null); }}>Prendre RDV</button>
          <button className={`nav-btn ${activeTab === 'mes-visites' ? 'active' : ''}`} onClick={() => setActiveTab('mes-visites')}>Mes Visites</button>
          <button className={`nav-btn ${activeTab === 'mes-factures' ? 'active' : ''}`} onClick={() => setActiveTab('mes-factures')}>Mes Factures</button>
          <button className={`nav-btn ${activeTab === 'mon-medecin' ? 'active' : ''}`} onClick={() => setActiveTab('mon-medecin')}>Mon Médecin</button>
        </nav>

        <button className="logout-btn" onClick={onLogout}>Déconnexion</button>
      </aside>

      <main className="patient-main">
        <header className="patient-header">
          <div>
            <h1>Bonjour, {user?.prenom_utilisateur || user?.nom_utilisateur} </h1>
            <p>Gérez vos rendez-vous et suivez votre santé</p>
          </div>
        </header>

        <div className="patient-content">
          {activeTab === 'mon-agenda' && (
            <div className="page-section">
              <h2> Mon Agenda</h2>
              {aDejaRDV ? (
                dbAppointments.map(rdv => (
                  <div key={rdv.id_RDV} className="rdv-actuel-card" style={{marginBottom: '15px'}}>
                    <div className="rdv-header">
                      <h3>Rendez-vous #{rdv.id_RDV}</h3>
                      <span className={`rdv-status ${rdv.statut.toLowerCase()}`}>{rdv.statut}</span>
                    </div>
                    <div className="rdv-details-box">
                      <div className="rdv-info-item">Date: <strong>{new Date(rdv.date_rdv).toLocaleDateString('fr-FR')}</strong></div>
                      <div className="rdv-info-item">Heure: <strong>{rdv.heure_rdv}</strong></div>
                    </div>
                    
                    {rdv.statut !== "Annulé" && rdv.statut !== "Effectué" && (
                      <div className="rdv-actions" style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                        <button onClick={() => handleModifier(rdv)} className="btn-modifier" style={{ backgroundColor: '#ffc107', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Modifier</button>
                        <button onClick={() => handleAnnuler(rdv.id_RDV)} className="btn-annuler" style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Annuler</button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="no-rdv-card">
                  <p>Vous n'avez aucun rendez-vous prévu</p>
                  <button className="btn-prendre-rdv" onClick={() => setActiveTab('prendre-rdv')}>Prendre un rendez-vous</button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'prendre-rdv' && (
            <div className="page-section">
              <h2> {editingId ? "Modifier le Rendez-vous" : "Prendre un Rendez-vous"}</h2>
              <div className="rdv-form-container">
                <form className="rdv-form" onSubmit={handleSubmitRDV}>
                  <div className="form-row">
                    <div className="form-field">
                      <label>Type de visite *</label>
                      <select required>
                        <option value="visite_simple">Visite simple</option>
                        {peutPrendreControle && <option value="controle">Contrôle (Gratuit)</option>}
                      </select>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-field">
                      <label>Date souhaitée *</label>
                      <input type="date" name="date_rdv" value={formData.date_rdv} onChange={handleInputChange} required min={new Date().toISOString().split('T')[0]}/>
                    </div>
                    <div className="form-field">
                      <label>Heure *</label>
                      <input type="time" name="heure_rdv" value={formData.heure_rdv} onChange={handleInputChange} required />
                    </div>
                  </div>
                  <button type="submit" className="btn-submit-rdv">
                    {editingId ? "Confirmer la modification" : "Confirmer le rendez-vous"}
                  </button>
                  {editingId && <button type="button" onClick={() => setEditingId(null)} style={{marginLeft: '10px'}}>Annuler modif</button>}
                </form>
              </div>
            </div>
          )}

          {/* Les autres sections (Visites, Factures, Médecin) restent inchangées */}
          {activeTab === 'mes-visites' && (
            <div className="page-section">
              <h2>🩺 Historique de mes Visites</h2>
              <div className="visites-timeline">
                {dbVisits.length > 0 ? dbVisits.map(v => (
                  <div key={v.id_visite} className="visite-card">
                    <h3>Visite #{v.id_visite}</h3>
                    <p>Diagnostic: {v.diagnostic || "Non renseigné"}</p>
                  </div>
                )) : <p>Aucun historique trouvé.</p>}
              </div>
            </div>
          )}

          {activeTab === 'mes-factures' && (

            <div className="page-section">

            <h2>💳 Mes Factures</h2>

            <div className="factures-patient-grid">

            {factures.length > 0 ? factures.map(facture => (

            <div key={facture.id_facture} className="facture-patient-card">

            <div className="facture-header-section">

            {/* On affiche l'ID ou la date car 'numero' n'existe pas dans votre table */}

            <h3>Facture #{facture.id_facture}</h3>

            <span className={`facture-status ${facture.etat.toLowerCase()}`}>

            {facture.etat}

            </span>

            </div>


            <div className="facture-montants">

            <div className="montant-row">

            <span>Montant acte :</span>

            <strong>{facture.montant} MAD</strong> {/* Correction ici */}

            </div>

            <div className="montant-row">

            <span>Avance versée :</span>

            <strong className="montant-paye">{facture.avance} MAD</strong> {/* Correction ici */}

            </div>

            {facture.reste > 0 && (

            <div className="montant-row reste">

            <span>Reste à payer :</span>

            <strong className="montant-reste" style={{color: 'red'}}>

            {facture.reste} MAD

            </strong>

            </div>

            )}

            </div>


            <div className="facture-date-footer">

            Émise le : {new Date(facture.date_facture).toLocaleDateString('fr-FR')}

            </div>

            </div>

            )) : <p>Aucune facture disponible.</p>}

            </div>

            </div>

            )}

{activeTab === 'mon-medecin' && (
  <div className="page-section">
    <h2>Mon Médecin Traitant</h2>
    {medecinTraitant ? (
      <div className="medecin-traitant-card" style={{ padding: '25px', border: '1px solid #e0e0e0', borderRadius: '12px', backgroundColor: '#f9f9f9' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#00ababff', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginRight: '15px' }}>
            Dr
          </div>
          <div>
            <h3 style={{ margin: 0 }}>Dr. {medecinTraitant.nom || "Référent"}</h3>
            <span style={{ color: '#00ababff', fontWeight: 'bold' }}>{medecinTraitant.specialite}</span>
          </div>
        </div>

        <div className="medecin-details-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
          <div>
            <p><strong>Identifiant Praticien :</strong> #{medecinTraitant.id_medecin}</p>
            <p><strong>Téléphone :</strong> {medecinTraitant.telephone || "Non renseigné"}</p>
          </div>
          <div>
            <p><strong>Email :</strong> {medecinTraitant.email || "Non renseigné"}</p>
            <p><strong>Horaires :</strong> 08:00 - 18:00</p>
          </div>
        </div>

        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#00abab54', borderRadius: '6px', color: 'rgba(0, 87, 179, 0.49)bff', fontSize: '0.9em' }}>
          ℹ️ Ce médecin suit votre dossier médical. Tous vos prochains rendez-vous et prescriptions lui seront rattachés.
        </div>
      </div>
    ) : (
      <p className="loading-text">Recherche de votre médecin traitant...</p>
    )}
  </div>
)}
        </div>
      </main>
    </div>
  );
};

export default PatientDashboard;